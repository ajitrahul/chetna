import SwissEph from 'swisseph-wasm';

// Simple Mutex for WASM concurrency control
class Mutex {
    private mutex = Promise.resolve();

    async lock(): Promise<() => void> {
        let resolve: () => void;
        const promise = new Promise<void>(res => {
            resolve = res;
        });

        const oldMutex = this.mutex;
        this.mutex = oldMutex.then(() => promise);

        await oldMutex;
        return resolve!;
    }
}
const calcMutex = new Mutex();

// Singleton instance to avoid re-initializing WASM
let sweInstance: SwissEph | null = null;
let swePromise: Promise<SwissEph> | null = null;

async function getSwe() {
    if (sweInstance) return sweInstance;

    if (!swePromise) {
        swePromise = (async () => {
            const instance = new SwissEph();
            await instance.initSwissEph();
            sweInstance = instance;
            return instance;
        })();
    }

    return swePromise;
}

export interface PlanetPosition {
    name: string;
    longitude: number;
    latitude: number;
    distance: number;
    speed: number;
    isRetrograde: boolean;
    house?: number;
    navamsaSign?: string; // D9 Sign
    dignity?: string;     // Exalted, Debilitated, Own Sign, Great Friend, etc.
}

export interface ChartData {
    planets: Record<string, PlanetPosition>;
    houses: number[];
    ascendant: number;
    mc: number;
    navamsaAscendant?: number;
    dashas?: Array<{ lord: string; start: string; end: string; isCurrent: boolean }>;
}

// Dignity Configuration
const PLANET_DIGNITIES: Record<string, { exalted: string, debilitated: string, own: string[] }> = {
    'Sun': { exalted: 'Aries', debilitated: 'Libra', own: ['Leo'] },
    'Moon': { exalted: 'Taurus', debilitated: 'Scorpio', own: ['Cancer'] },
    'Mars': { exalted: 'Capricorn', debilitated: 'Cancer', own: ['Aries', 'Scorpio'] },
    'Mercury': { exalted: 'Virgo', debilitated: 'Pisces', own: ['Gemini', 'Virgo'] },
    'Jupiter': { exalted: 'Cancer', debilitated: 'Capricorn', own: ['Sagittarius', 'Pisces'] },
    'Venus': { exalted: 'Pisces', debilitated: 'Virgo', own: ['Taurus', 'Libra'] },
    'Saturn': { exalted: 'Libra', debilitated: 'Aries', own: ['Capricorn', 'Aquarius'] },
    'Rahu': { exalted: 'Taurus', debilitated: 'Scorpio', own: ['Aquarius'] },
    'Ketu': { exalted: 'Scorpio', debilitated: 'Taurus', own: ['Scorpio'] }
};


export function getNavamsaSign(longitude: number): string {
    // 1 Navamsa = 3°20' = 3.3333 degrees
    // Each Sign (30°) has 9 Navamsas
    // Sequence restarts at Aries, Capricorn, Libra, Cancer (Movable, Fixed, Dual logic simplified)

    // D9 Calc Logic:
    // Fire Signs (1,5,9): Starts from Aries
    // Earth Signs (2,6,10): Starts from Capricorn
    // Air Signs (3,7,11): Starts from Libra
    // Water Signs (4,8,12): Starts from Cancer

    const signIndex = Math.floor(longitude / 30); // 0 = Aries
    const navamsaInSign = Math.floor((longitude % 30) / 3.33333333); // 0-8

    let startSignIndex = 0;
    const element = (signIndex) % 4; // 0=Fire, 1=Earth, 2=Air, 3=Water

    if (element === 0) startSignIndex = 0; // Aries
    else if (element === 1) startSignIndex = 9; // Capricorn
    else if (element === 2) startSignIndex = 6; // Libra
    else if (element === 3) startSignIndex = 3; // Cancer

    const finalSignIndex = (startSignIndex + navamsaInSign) % 12;

    const signs = [
        'Aries', 'Taurus', 'Gemini', 'Cancer',
        'Leo', 'Virgo', 'Libra', 'Scorpio',
        'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    return signs[finalSignIndex];
}

export function getDignity(planetName: string, signName: string): string {
    const config = PLANET_DIGNITIES[planetName];
    if (!config) return 'Neutral';

    if (config.exalted === signName) return 'Exalted';
    if (config.debilitated === signName) return 'Debilitated';
    if (config.own.includes(signName)) return 'Own Sign';

    return 'Neutral'; // Simplified; typically would check Friends/Enemies
}

export async function calculateChart(
    year: number,
    month: number,
    day: number,
    hour: number,
    lat: number,
    lng: number,
    timezone: number = 5.5 // Default to IST (India)
): Promise<ChartData> {
    const unlock = await calcMutex.lock();
    try {
        const swe = await getSwe();
        if (typeof swe.calc_ut !== 'function') throw new Error('SwissEph instance not properly initialized: calc_ut missing');

        const PLANETS_CONFIG = {
            Sun: swe.SE_SUN ?? 0,
            Moon: swe.SE_MOON ?? 1,
            Mars: swe.SE_MARS ?? 4,
            Mercury: swe.SE_MERCURY ?? 2,
            Jupiter: swe.SE_JUPITER ?? 5,
            Venus: swe.SE_VENUS ?? 3,
            Saturn: swe.SE_SATURN ?? 6,
            Rahu: swe.SE_MEAN_NODE ?? 10,
        };

        const utcHour = hour - timezone;
        // @ts-expect-error - SwissEph julday might only take 4 args in some versions
        const julianDay = swe.julday(year, month, day, utcHour, swe.SE_GREG_CAL);
        swe.set_sid_mode(1, 0, 0); // Lahiri

        const calcFlags = 65538; // Speed + Sidereal
        const planets: Record<string, PlanetPosition> = {};
        // @ts-expect-error - SwissEph types might not match wasm signature
        const ayanamsa = swe.get_ayanamsa_ut(julianDay);

        for (const [name, id] of Object.entries(PLANETS_CONFIG)) {
            try {
                const posArr = swe.calc_ut(julianDay, id, calcFlags);
                if (!posArr || posArr.length < 3) continue;

                const pos = {
                    name,
                    longitude: posArr[0],
                    latitude: posArr[1],
                    distance: posArr[2],
                    speed: posArr[3] || 0,
                    isRetrograde: (posArr[3] || 0) < 0,
                };

                // Add D1 Sign
                const d1Sign = getZodiacSign(pos.longitude);

                // Add derived data
                const navamsaSign = getNavamsaSign(pos.longitude);
                const dignity = getDignity(name, d1Sign);

                planets[name] = { ...pos, house: 0, navamsaSign, dignity };

                if (name === 'Rahu') {
                    // Ketu is opposite Rahu
                    const ketuLong = (pos.longitude + 180) % 360;
                    const ketuD1Sign = getZodiacSign(ketuLong);
                    const ketuNavamsa = getNavamsaSign(ketuLong);
                    const ketuDignity = getDignity('Ketu', ketuD1Sign);

                    planets['Ketu'] = {
                        name: 'Ketu',
                        longitude: ketuLong,
                        latitude: -pos.latitude,
                        distance: pos.distance,
                        speed: pos.speed,
                        isRetrograde: pos.isRetrograde,
                        house: 0,
                        navamsaSign: ketuNavamsa,
                        dignity: ketuDignity
                    };
                }
            } catch (error) {
                console.error(`Error calculating ${name}:`, error);
            }
        }

        // Ascendant Calc
        let ascendant = 0;
        let mc = 0;

        try {
            const gmstHours = swe.sidtime(julianDay);
            let lstHours = gmstHours + (lng / 15.0);
            while (lstHours < 0) lstHours += 24;
            while (lstHours >= 24) lstHours -= 24;
            const ramc = lstHours * 15.0;
            const eclObj = swe.calc_ut(julianDay, -1, 0);
            const eps = (eclObj && eclObj.length) ? eclObj[0] : 23.43758;
            const d2r = Math.PI / 180.0;
            const r2d = 180.0 / Math.PI;
            const ramcRad = ramc * d2r;
            const epsRad = eps * d2r;
            const latRad = lat * d2r;
            const y = -Math.cos(ramcRad);
            const x = (Math.sin(ramcRad) * Math.cos(epsRad)) + (Math.tan(latRad) * Math.sin(epsRad));
            const ascRad = Math.atan2(y, x);
            let ascDeg = (ascRad * r2d) + 180;
            ascDeg = (ascDeg % 360 + 360) % 360;
            ascendant = (ascDeg - ayanamsa + 360) % 360;
            mc = (ramc - ayanamsa + 360) % 360;
        } catch (err) {
            console.error('Ascendant calc error', err);
            ascendant = planets.Sun?.longitude || 0;
        }

        // House Calc (Whole Sign)
        const ascSignStart = Math.floor(ascendant / 30) * 30;
        const houses: number[] = [];
        for (let i = 0; i < 12; i++) {
            houses.push((ascSignStart + i * 30) % 360);
        }

        // Calculate D9 Ascendant
        // const navamsaAscendantSign = getNavamsaSign(ascendant);

        // Calculate Vimsottari Dashas
        const birthDateObj = new Date(year, month - 1, day);
        // Add decimal hour roughly (doesn't need to be perfect sec precision for Dasha dates, usually just Date matters)
        birthDateObj.setHours(Math.floor(hour), Math.floor((hour % 1) * 60));

        const moonLong = planets['Moon']?.longitude || 0;
        const dashas = calculateVimsottariDashas(moonLong, birthDateObj);

        return {
            planets,
            houses,
            ascendant,
            mc,
            navamsaAscendant: 0,
            dashas: dashas.map(d => ({
                lord: d.lord,
                start: d.start,
                end: d.end,
                isCurrent: d.isCurrent
            }))
        };
    } finally {
        unlock();
    }
}

export const NAKSHATRAS = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
    'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

export const NAKSHATRA_LORDS = [
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
];

export const DASHA_YEARS: Record<string, number> = {
    'Ketu': 7,
    'Venus': 20,
    'Sun': 6,
    'Moon': 10,
    'Mars': 7,
    'Rahu': 18,
    'Jupiter': 16,
    'Saturn': 19,
    'Mercury': 17
};

export function getNakshatra(longitude: number): { name: string, index: number, lord: string, degreeInNakshatra: number } {
    const nakshatraSize = 360 / 27;
    const index = Math.floor(longitude / nakshatraSize);
    const lordIndex = index % 9;
    const degreeInNakshatra = longitude % nakshatraSize;
    return {
        name: NAKSHATRAS[index],
        index,
        lord: NAKSHATRA_LORDS[lordIndex],
        degreeInNakshatra
    };
}

export function calculateVimsottariDashas(moonLong: number, birthDate: Date) {
    const nak = getNakshatra(moonLong);
    const nakSize = 360 / 27;
    const lordYears = DASHA_YEARS[nak.lord];

    // Remaining years in first dasha: (Years * (NakSize - degreeInNak)) / NakSize
    const elapsedRatio = nak.degreeInNakshatra / nakSize;
    const remainingRatio = 1 - elapsedRatio;
    const yearsRemaining = lordYears * remainingRatio;

    const dashas: Array<{ lord: string; start: Date; end: Date; isCurrent: boolean }> = [];
    let currentDate = new Date(birthDate);

    // Find index of starting lord in sequence
    let lordIdx = NAKSHATRA_LORDS.indexOf(nak.lord);

    // Calculate first partial dasha
    const firstEndDate = new Date(currentDate);
    firstEndDate.setFullYear(firstEndDate.getFullYear() + Math.floor(yearsRemaining));
    const remainingDays = (yearsRemaining % 1) * 365.25;
    firstEndDate.setDate(firstEndDate.getDate() + Math.round(remainingDays));

    dashas.push({
        lord: nak.lord,
        start: new Date(currentDate),
        end: new Date(firstEndDate),
        isCurrent: false // will set later
    });

    currentDate = new Date(firstEndDate);

    // Calculate next full cycle (9 lords)
    for (let i = 1; i < 9; i++) {
        lordIdx = (lordIdx + 1) % 9;
        const nextLord = NAKSHATRA_LORDS[lordIdx];
        const years = DASHA_YEARS[nextLord];

        const endDate = new Date(currentDate);
        endDate.setFullYear(endDate.getFullYear() + years);

        dashas.push({
            lord: nextLord,
            start: new Date(currentDate),
            end: new Date(endDate),
            isCurrent: false
        });

        currentDate = new Date(endDate);
    }

    const now = new Date();
    return dashas.map(d => ({
        ...d,
        start: d.start.toISOString(),
        end: d.end.toISOString(),
        isCurrent: now >= d.start && now < d.end
    }));
}

export function getZodiacSign(longitude: number): string {
    const signs = [
        'Aries', 'Taurus', 'Gemini', 'Cancer',
        'Leo', 'Virgo', 'Libra', 'Scorpio',
        'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    return signs[Math.floor(longitude / 30)];
}

export const TITHIS = [
    'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
    'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya'
];

export const YOGAS = [
    'Vishkumbha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'
];

export const KARANAS = [
    'Bava', 'Balav', 'Kaulav', 'Taitil', 'Gar', 'Vanij', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kintughna'
];

export const VARAS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export async function calculatePanchang(
    year: number,
    month: number,
    day: number,
    hour: number,
    lat: number,
    lng: number
) {
    const chart = await calculateChart(year, month, day, hour, lat, lng);
    const sunLong = chart.planets.Sun.longitude;
    const moonLong = chart.planets.Moon.longitude;

    // 1. Tithi
    let diff = moonLong - sunLong;
    if (diff < 0) diff += 360;
    const tithiIndex = Math.floor(diff / 12);
    const tithiName = TITHIS[tithiIndex];
    const paksha = tithiIndex < 15 ? 'Shukla (Waxing)' : 'Krishna (Waning)';

    // 2. Vara
    const date = new Date(year, month - 1, day);
    const varaName = VARAS[date.getDay()];

    // 3. Nakshatra
    const nak = getNakshatra(moonLong);

    // 4. Yoga
    let totalLong = moonLong + sunLong;
    if (totalLong >= 360) totalLong -= 360;
    const yogaIndex = Math.floor(totalLong / (360 / 27));
    const yogaName = YOGAS[yogaIndex % 27];

    //5. Karana
    // Simplified Karana calculation
    const karanaIndex = Math.floor(diff / 6);
    let karanaName = '';
    if (karanaIndex === 0) karanaName = 'Kintughna';
    else if (karanaIndex >= 1 && karanaIndex <= 57) {
        karanaName = KARANAS[(karanaIndex - 1) % 7];
    } else {
        karanaName = KARANAS[karanaIndex - 51]; // Fixed Karanas at the end
    }

    return {
        tithi: { name: tithiName, paksha, index: tithiIndex + 1 },
        vara: varaName,
        nakshatra: { name: nak.name, lord: nak.lord },
        yoga: yogaName,
        karana: karanaName,
        sunSign: getZodiacSign(sunLong),
        moonSign: getZodiacSign(moonLong)
    };
}
