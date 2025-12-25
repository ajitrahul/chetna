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
let sweInstance: any = null;
let swePromise: Promise<any> | null = null;

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
    lng: number,
    timezone: number = 5.5 // Default to IST (India)
): Promise<ChartData> {
    const unlock = await calcMutex.lock();
    try {
        const swe = await getSwe();

        // Ensure the instance has the required methods
        if (typeof swe.calc_ut !== 'function') {
            throw new Error('SwissEph instance not properly initialized: calc_ut missing');
        }

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

        // 1. Convert local time to Julian Day (UTC)
        // Adjust local hour by timezone to get UTC hour
        const utcHour = hour - timezone;
        const julianDay = swe.julday(year, month, day, utcHour, swe.SE_GREG_CAL);

        // 2. Set Sidereal Mode (Lahiri Ayanamsa = 1)
        // This is critical for Vedic Astrology
        swe.set_sid_mode(1, 0, 0);

        // 3. Calculate Planets (Sidereal)
        // SEFLG_SWIEPH (2) | SEFLG_SIDEREAL (64 * 1024 = 65536) = 65538
        const calcFlags = 65538;

        const planets: Record<string, PlanetPosition> = {};

        // Calculate Ayanamsa (needed for Ascendant adjustment if houses returns Tropical)
        const ayanamsa = swe.get_ayanamsa_ut(julianDay);
        console.log('Ayanamsa:', ayanamsa);

        for (const [name, id] of Object.entries(PLANETS_CONFIG)) {
            try {
                const posArr = swe.calc_ut(julianDay, id, calcFlags);

                if (!posArr || posArr.length < 3) {
                    console.warn(`Skipping ${name} due to calculation error`);
                    continue;
                }

                // posArr[0] is the Longitude
                const pos = {
                    longitude: posArr[0],
                    latitude: posArr[1],
                    distance: posArr[2],
                    speed: posArr[3] || 0
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
            } catch (error) {
                console.error(`Error calculating ${name}:`, error);
            }
        }

        // 4. Calculate Ascendant & Houses
        let ascendant = 0;
        let mc = 0;

        try {
            // Manual Calculation of Ascendant (Lagna) to bypass flaky WASM house functions
            // Formula: tan(Asc) = -cos(RAMC) / (sin(RAMC)*cos(E) + tan(Lat)*sin(E))

            // 1. Get GMST (Greenwich Mean Sidereal Time)
            const gmstHours = swe.sidtime(julianDay);

            // 2. Convert to Local Sidereal Time (LST)
            // LST = GMST + Longitude/15
            let lstHours = gmstHours + (lng / 15.0);
            // Normalize to 0-24
            while (lstHours < 0) lstHours += 24;
            while (lstHours >= 24) lstHours -= 24;

            // 3. RAMC (Right Ascension of Meridian) in degrees
            const ramc = lstHours * 15.0;

            // 4. Obliquity of Ecliptic (E)
            // Use standard J2000 epoch approx or calculated
            const eclObj = swe.calc_ut(julianDay, -1, 0); // SE_ECL_NUT = -1
            const eps = (eclObj && eclObj.length) ? eclObj[0] : 23.43758;

            // 5. Math Trigs
            const d2r = Math.PI / 180.0;
            const r2d = 180.0 / Math.PI;

            const ramcRad = ramc * d2r;
            const epsRad = eps * d2r;
            const latRad = lat * d2r;

            // 6. Apply Formula
            const y = -Math.cos(ramcRad);
            const x = (Math.sin(ramcRad) * Math.cos(epsRad)) + (Math.tan(latRad) * Math.sin(epsRad));

            let ascRad = Math.atan2(y, x);
            let ascDeg = (ascRad * r2d) + 180; // Add 180 to correct for quadrant (formula calculated Descendant)

            // Normalize 0-360
            ascDeg = (ascDeg % 360 + 360) % 360;

            // 7. Convert Tropical to Sidereal (Lahiri)
            ascendant = (ascDeg - ayanamsa + 360) % 360;

            // MC is roughly RAMC (Tropical) - Ayanamsa
            mc = (ramc - ayanamsa + 360) % 360;

            console.log('Manual Ascendant Calc Success:', {
                gmst: gmstHours,
                lst: lstHours,
                tropicalAsc: ascDeg,
                siderealAsc: ascendant,
                ayanamsa
            });

        } catch (err) {
            console.error('Manual Ascendant calculation failed:', err);
            // Fallback: Use Sun Sign
            const sunVal = planets.Sun?.longitude || 0;
            ascendant = Math.floor(sunVal / 30) * 30;
        }

        // 5. Generate Whole Sign Houses relative to Sidereal Ascendant
        // In Vedic Whole Sign: 1st House starts at 0° of the Ascendant Sign
        const ascSignStart = Math.floor(ascendant / 30) * 30;
        const houses: number[] = [];
        for (let i = 0; i < 12; i++) {
            houses.push((ascSignStart + i * 30) % 360);
        }

        return {
            planets,
            houses,
            ascendant,
            mc,
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

    const dashas: any[] = [];
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
    dashas.forEach(d => {
        if (now >= d.start && now < d.end) {
            d.isCurrent = true;
        }
    });

    return dashas;
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
