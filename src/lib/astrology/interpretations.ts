export const PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu'];
export const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

export const SIGN_LORDS: Record<string, string> = {
    'Aries': 'Mars',
    'Taurus': 'Venus',
    'Gemini': 'Mercury',
    'Cancer': 'Moon',
    'Leo': 'Sun',
    'Virgo': 'Mercury',
    'Libra': 'Venus',
    'Scorpio': 'Mars',
    'Sagittarius': 'Jupiter',
    'Capricorn': 'Saturn',
    'Aquarius': 'Saturn',
    'Pisces': 'Jupiter'
};

export const PLANET_SORT_ORDER = ['Ascendant', 'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu'];

export function getSignIndex(signName: string): number {
    return SIGNS.indexOf(signName);
}

export function getHouseNumber(planetSignIndex: number, ascendantSignIndex: number): number {
    // 0-indexed result: 0 = 1st House, 1 = 2nd House
    // Formula: (Planet - Asc + 12) % 12
    return ((planetSignIndex - ascendantSignIndex + 12) % 12) + 1;
}

export function getConjunctions(planetName: string, planetSignIndex: number, allPlanets: Record<string, any>): string[] {
    const conjunctions: string[] = [];
    for (const [pName, pData] of Object.entries(allPlanets)) {
        if (pName === planetName) continue;
        if (!PLANETS.includes(pName)) continue; // Filter out Upagrahas if present

        // Check if in same sign
        const pSignIndex = Math.floor(pData.longitude / 30);
        if (pSignIndex === planetSignIndex) {
            conjunctions.push(pName);
        }
    }
    return conjunctions;
}

export function getAspects(currentPlanet: string, planetSignIndex: number, allPlanets: Record<string, any>): string[] {
    const aspectingPlanets: string[] = [];

    // Iterate through all other planets to see if they aspect the current planet's sign
    for (const [pName, pData] of Object.entries(allPlanets)) {
        if (pName === currentPlanet) continue;
        if (!PLANETS.includes(pName)) continue;

        const pSignIndex = Math.floor(pData.longitude / 30);
        const diff = (planetSignIndex - pSignIndex + 12) % 12; // Houses away from aspecting planet
        const houseFromPlanet = diff + 1;

        // Parashari Aspects
        let isAspecting = false;

        // All planets aspect 7th
        if (houseFromPlanet === 7) isAspecting = true;

        // Special Aspects
        if (pName === 'Mars' && (houseFromPlanet === 4 || houseFromPlanet === 8)) isAspecting = true;
        if (pName === 'Jupiter' && (houseFromPlanet === 5 || houseFromPlanet === 9)) isAspecting = true;
        if (pName === 'Saturn' && (houseFromPlanet === 3 || houseFromPlanet === 10)) isAspecting = true;
        if (pName === 'Rahu' && (houseFromPlanet === 5 || houseFromPlanet === 9)) isAspecting = true; // Some use 5/9 for Nodes
        if (pName === 'Ketu' && (houseFromPlanet === 5 || houseFromPlanet === 9)) isAspecting = true;

        if (isAspecting) {
            aspectingPlanets.push(pName);
        }
    }
    return aspectingPlanets;
}

export function formatDegree(decimalDegree: number): string {
    const deg = Math.floor(decimalDegree % 30);
    const minDecimal = (decimalDegree % 1) * 60;
    const min = Math.floor(minDecimal);
    const sec = Math.round((minDecimal % 1) * 60);
    return `${deg}° ${min}' ${sec}"`;
}
