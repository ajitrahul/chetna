import SwissEph from 'swisseph-wasm';

// Singleton instance to avoid re-initializing WASM
let sweInstance: any = null;

async function getSwe() {
    if (!sweInstance) {
        sweInstance = new SwissEph();
        await sweInstance.initSwissEph();
    }
    return sweInstance;
}

export interface PlanetPosition {
    name: string;
    longitude: number;
    latitude: number;
    distance: number;
    speed: number;
    isRetrograde: boolean;
    house?: number;
}

export interface ChartData {
    planets: Record<string, PlanetPosition>;
    houses: number[];
    ascendant: number;
    mc: number;
}

export async function calculateChart(
    year: number,
    month: number,
    day: number,
    hour: number,
    lat: number,
    lng: number
): Promise<ChartData> {
    const swe = await getSwe();

    const PLANETS_CONFIG = {
        Sun: swe.SE_SUN,
        Moon: swe.SE_MOON,
        Mars: swe.SE_MARS,
        Mercury: swe.SE_MERCURY,
        Jupiter: swe.SE_JUPITER,
        Venus: swe.SE_VENUS,
        Saturn: swe.SE_SATURN,
        Rahu: swe.SE_MEAN_NODE, // North Node
    };

    // 1. Convert local time to Julian Day (UTC)
    const julianDay = swe.julday(year, month, day, hour, swe.SE_GREG_CAL);

    const planets: Record<string, PlanetPosition> = {};

    // 2. Calculate Planets
    for (const [name, id] of Object.entries(PLANETS_CONFIG)) {
        // calc_ut returns Float64Array [long, lat, dist, longSpeed, latSpeed, distSpeed]
        const posArr = swe.calc_ut(julianDay, id, swe.SEFLG_SPEED);

        const pos = {
            longitude: posArr[0],
            latitude: posArr[1],
            distance: posArr[2],
            speed: posArr[3]
        };

        if (name === 'Rahu') {
            planets['Ketu'] = {
                name: 'Ketu',
                longitude: (pos.longitude + 180) % 360,
                latitude: -pos.latitude,
                distance: pos.distance,
                speed: pos.speed,
                isRetrograde: pos.speed < 0,
            };
        }

        planets[name] = {
            name,
            longitude: pos.longitude,
            latitude: pos.latitude,
            distance: pos.distance,
            speed: pos.speed,
            isRetrograde: pos.speed < 0,
        };
    }

    // 3. Calculate Houses
    // 'P' = Placidus
    const housesResult = swe.houses(julianDay, lat, lng, 'P');

    return {
        planets,
        houses: Array.from(housesResult.house),
        ascendant: housesResult.ascendant,
        mc: housesResult.mc,
    };
}

export function getZodiacSign(longitude: number): string {
    const signs = [
        'Aries', 'Taurus', 'Gemini', 'Cancer',
        'Leo', 'Virgo', 'Libra', 'Scorpio',
        'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    return signs[Math.floor(longitude / 30)];
}
