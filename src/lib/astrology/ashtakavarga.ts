import { ChartData } from './calculator';

// Reference: Brihat Parashara Hora Shastra (BPHS)
// The houses (1-indexed) from each planet where they contribute a Bindu (point) for a given transiting planet.
export const ASHTAKAVARGA_RULES: Record<string, Record<string, number[]>> = {
    Sun: {
        Sun: [1, 2, 4, 7, 8, 9, 10, 11],
        Moon: [3, 6, 10, 11],
        Mars: [1, 2, 4, 7, 8, 9, 10, 11],
        Mercury: [3, 5, 6, 9, 10, 11, 12],
        Jupiter: [5, 6, 9, 11],
        Venus: [6, 7, 12],
        Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
        Ascendant: [3, 4, 6, 10, 11, 12]
    },
    Moon: {
        Sun: [3, 6, 7, 8, 10, 11],
        Moon: [1, 3, 6, 7, 10, 11],
        Mars: [2, 3, 5, 6, 9, 10, 11],
        Mercury: [1, 3, 4, 5, 7, 8, 10, 11],
        Jupiter: [1, 4, 7, 8, 10, 11, 12],
        Venus: [3, 4, 5, 7, 9, 10, 11],
        Saturn: [3, 5, 6, 11],
        Ascendant: [3, 6, 10, 11]
    },
    Mars: {
        Sun: [3, 5, 6, 10, 11],
        Moon: [3, 6, 11],
        Mars: [1, 2, 4, 7, 8, 9, 10, 11],
        Mercury: [3, 5, 6, 11],
        Jupiter: [6, 10, 11, 12],
        Venus: [6, 8, 11],
        Saturn: [1, 4, 7, 8, 9, 10, 11],
        Ascendant: [1, 3, 6, 10, 11]
    },
    Mercury: {
        Sun: [5, 6, 9, 11, 12],
        Moon: [2, 4, 6, 8, 10, 11],
        Mars: [1, 2, 4, 7, 8, 9, 10, 11],
        Mercury: [1, 3, 5, 6, 9, 10, 11, 12],
        Jupiter: [6, 8, 11, 12],
        Venus: [1, 2, 3, 4, 5, 8, 9, 11],
        Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
        Ascendant: [1, 2, 4, 6, 8, 10, 11]
    },
    Jupiter: {
        Sun: [1, 2, 3, 4, 7, 8, 9, 10, 11],
        Moon: [2, 5, 7, 9, 11],
        Mars: [1, 2, 4, 7, 8, 10, 11],
        Mercury: [1, 2, 4, 5, 6, 9, 10, 11],
        Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
        Venus: [2, 5, 6, 9, 10, 11],
        Saturn: [3, 5, 6, 12],
        Ascendant: [1, 2, 4, 5, 6, 9, 10, 11]
    },
    Venus: {
        Sun: [8, 11, 12],
        Moon: [1, 2, 3, 4, 5, 8, 9, 11, 12],
        Mars: [3, 5, 6, 9, 11, 12],
        Mercury: [3, 5, 6, 9, 11],
        Jupiter: [5, 8, 9, 10, 11],
        Venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
        Saturn: [3, 4, 5, 8, 9, 10, 11],
        Ascendant: [1, 2, 3, 4, 5, 8, 9, 11]
    },
    Saturn: {
        Sun: [1, 2, 4, 7, 8, 10, 11],
        Moon: [3, 6, 11],
        Mars: [3, 5, 6, 10, 11],
        Mercury: [6, 8, 9, 10, 11, 12],
        Jupiter: [5, 6, 11, 12],
        Venus: [6, 11, 12],
        Saturn: [3, 5, 6, 11],
        Ascendant: [1, 3, 4, 6, 10, 11]
    }
};

/**
 * Valid planets for Ashtakavarga calculation. Nodes are excluded.
 */
const AV_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

/**
 * Calculates the Bhinna Ashtakavarga (BAV) score for a specific transiting planet in a target transit sign.
 * The score ranges from 0 to 8 bindus.
 * 
 * @param natalChart The user's natal chart
 * @param transitingPlanet The name of the planet we are calculating the score for (e.g., 'Jupiter')
 * @param transitSignIndex The zodiac sign index (0=Aries, 11=Pisces) the planet is currently transiting
 * @returns Total bindus (0-8)
 */
export function calculateBhav(natalChart: ChartData, transitingPlanet: string, transitSignIndex: number): number {
    if (!AV_PLANETS.includes(transitingPlanet)) return 0;
    
    let bindus = 0;
    const rulesForPlanet = ASHTAKAVARGA_RULES[transitingPlanet];
    
    // Check contributions from the 7 standard planets
    for (const p of AV_PLANETS) {
        const natalPos = natalChart.planets[p];
        if (natalPos) {
            const natalSign = Math.floor(natalPos.longitude / 30);
            // Calculate house position of the transit sign from the natal planet's sign (1-indexed)
            const houseFromNatal = (transitSignIndex - natalSign + 12) % 12 + 1;
            
            if (rulesForPlanet[p]?.includes(houseFromNatal)) {
                bindus++;
            }
        }
    }
    
    // Check contribution from Ascendant
    const ascSign = Math.floor(natalChart.ascendant / 30);
    const houseFromAsc = (transitSignIndex - ascSign + 12) % 12 + 1;
    if (rulesForPlanet['Ascendant']?.includes(houseFromAsc)) {
        bindus++;
    }
    
    return bindus;
}

/**
 * Calculates the total Bindus (rekhas) a planet receives in its current transit.
 * >= 5 is Excellent, 4 is Average/Good, <= 3 is Challenging.
 */
export function analyzePlanetAshtakavarga(natalChart: ChartData, transitingPlanet: string, currentLongitude: number) {
    const transitSignIdx = Math.floor(currentLongitude / 30);
    const score = calculateBhav(natalChart, transitingPlanet, transitSignIdx);
    
    let quality = 'Average';
    if (score >= 5) quality = 'Excellent';
    if (score <= 3) quality = 'Challenging';
    if (score >= 7) quality = 'Exceptional';
    if (score <= 1) quality = 'Severe Resistance';
    
    return {
        planet: transitingPlanet,
        score,
        max: 8,
        quality,
        meaning: `With ${score} bindus (points out of 8) in Ashtakavarga, the current transit of ${transitingPlanet} yields ${quality.toLowerCase()} results.`
    };
}
