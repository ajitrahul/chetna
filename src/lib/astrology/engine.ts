import { ChartData, getNavamsaSign, getDignity, getZodiacSign, getNakshatra } from './calculator';
import { SIGN_LORDS, SIGNS, getSignIndex, getAspects, getConjunctions } from './interpretations';

export interface AnalysisResult {
    planet: string;
    coreTheme: string;
    functionalRole: string;
    behaviourZone: string;
    emotionalTone: string;
    dignityScore: number;
    dignityLabel: string;
    influences: string[];
    pressures: string[];
    load: number;
    loadClassification: string;
    repetitionCause: string;
    nakshatra: string;
    nakshatraLord: string;
    nakshatraPada: number;
    preciseDegree: string;
    synthesis: {
        theme: string;
        acts_in: string;
        feels_like: string;
        strength: string;
        challenge: string;
        repeats_when: string;
        balances_with: string;
    };
}

const PLANET_THEMES: Record<string, string> = {
    'Sun': 'Core identity, vitality, authority, and soul purpose.',
    'Moon': 'Mind, emotions, receptivity, and nurturing.',
    'Mars': 'Action, assertion, physical energy, and drive.',
    'Mercury': 'Communication, intellect, analysis, and skill.',
    'Jupiter': 'Wisdom, expansion, abundance, and higher learning.',
    'Venus': 'Love, beauty, relationships, and refinement.',
    'Saturn': 'Discipline, structure, karma, and endurance.',
    'Rahu': 'Ambition, obsession, innovation, and expansion.',
    'Ketu': 'Spiritual detachment, past patterns, and liberation.'
};

const HOUSE_DOMAINS: Record<number, string> = {
    1: 'Self, personality, physical identity',
    2: 'Values, wealth, speech, second house',
    3: 'Effort, siblings, communication',
    4: 'Home, emotions, mother, peace',
    5: 'Creativity, intelligence, ancestors',
    6: 'Struggle, service, health, competition',
    7: 'Partnership, others, public life',
    8: 'Transformation, secrets, longevity',
    9: 'Wisdom, higher path, father, grace',
    10: 'Performance, status, public action',
    11: 'Gains, community, larger vision',
    12: 'Release, solitude, subconscious'
};

const SIGN_TONES: Record<string, string> = {
    'Aries': 'Dynamic, assertive, impulsive',
    'Taurus': 'Stable, grounded, sensual',
    'Gemini': 'Adaptable, curious, communicative',
    'Cancer': 'Emotional, protective, nurturing',
    'Leo': 'Confident, expressive, dramatic',
    'Virgo': 'Analytical, methodical, precise',
    'Libra': 'Harmonious, balanced, social',
    'Scorpio': 'Intense, transformative, private',
    'Sagittarius': 'Optimistic, philosophical, expansive',
    'Capricorn': 'Disciplined, ambitious, structured',
    'Aquarius': 'Innovative, humanitarian, detached',
    'Pisces': 'Intuitive, compassionate, spiritual'
};

/**
 * Advanced Vedic Analysis Engine
 * Implements the "Chronological Analysis Framework"
 */
export class VedicAnalysisEngine {

    static analyze(chartData: ChartData): AnalysisResult[] {
        const results: AnalysisResult[] = [];
        const ascSignIndex = Math.floor(chartData.ascendant / 30);

        for (const [planetName, pos] of Object.entries(chartData.planets)) {
            const planetSignIndex = Math.floor(pos.longitude / 30);
            const signName = getZodiacSign(pos.longitude);
            const house = ((planetSignIndex - ascSignIndex + 12) % 12) + 1;

            // 1. Planet Identity
            const coreTheme = PLANET_THEMES[planetName] || 'Unknown';

            // 2. Functional Role (Based on Ascendant/Houses Ruled)
            const functionalRole = this.getFunctionalRole(planetName, ascSignIndex);

            // 3. House Placement
            const behaviourZone = HOUSE_DOMAINS[house] || 'Unknown';

            // 4. Sign Placement
            const emotionalTone = SIGN_TONES[signName] || 'Unknown';

            // 5. Dignity Scoring
            const dignityScore = this.calculateDignityScore(planetName, signName, pos);
            const dignityLabel = this.getDignityLabel(dignityScore);

            // 6. Associations (Conjunctions)
            const influences = getConjunctions(planetName, planetSignIndex, chartData.planets);

            // 7. Aspects
            const pressures = getAspects(planetName, planetSignIndex, chartData.planets);

            // 8. Load Calculation
            const load = this.calculateLoad(planetName, influences, pressures, functionalRole);
            const loadClassification = this.classifyLoad(load);

            // 9. Nakshatra Compulsion
            const nakData = getNakshatra(pos.longitude);
            const repetitionCause = nakData.name;
            const nakshatra = nakData.name;
            const nakshatraLord = nakData.lord;
            const nakshatraPada = Math.floor((pos.longitude % (30 / 9)) / (30 / 36)) + 1; // Simplistic pada calc
            const preciseDegree = (pos.longitude % 30).toFixed(2);

            // 10. Synthesis
            const synthesis = this.synthesize(planetName, house, signName, dignityLabel, loadClassification);

            results.push({
                planet: planetName,
                coreTheme,
                functionalRole,
                behaviourZone,
                emotionalTone,
                dignityScore,
                dignityLabel,
                influences,
                pressures,
                load,
                loadClassification,
                repetitionCause,
                nakshatra,
                nakshatraLord,
                nakshatraPada,
                preciseDegree,
                synthesis
            });
        }

        return results;
    }

    private static getFunctionalRole(planet: string, ascIndex: number): string {
        // Basic Parashari Lordship
        // Kendra: 1, 4, 7, 10
        // Trikona: 1, 5, 9
        // Dusthana: 6, 8, 12

        // Find signs ruled by this planet
        const ruledSigns = Object.entries(SIGN_LORDS)
            .filter(([_, lord]) => lord === planet)
            .map(([sign, _]) => getSignIndex(sign));

        // Map signs to houses relative to Ascendant
        const ruledHouses = ruledSigns.map(sIdx => ((sIdx - ascIndex + 12) % 12) + 1);

        const isTrikonaLord = ruledHouses.some(h => [1, 5, 9].includes(h));
        const isDusthanaLord = ruledHouses.some(h => [6, 8, 12].includes(h));

        if (isTrikonaLord && !isDusthanaLord) return "Functional Benefic";
        if (isDusthanaLord && !isTrikonaLord) return "Functional Malefic";
        if (isTrikonaLord && isDusthanaLord) return "Mixed - Challenge & Growth";

        return "Neutral / Variable";
    }

    private static calculateDignityScore(planet: string, sign: string, pos: any): number {
        let score = 0;
        const basicDignity = getDignity(planet, sign);

        if (basicDignity === 'Exalted') score += 2;
        else if (basicDignity === 'Own Sign') score += 1;
        else if (basicDignity === 'Debilitated') score -= 2;

        if (pos.isRetrograde) score -= 0.5;
        // Combust check would happen here if we had Sun proximity

        return score;
    }

    private static getDignityLabel(score: number): string {
        if (score >= 2) return "High delivery capacity";
        if (score >= 0.5) return "Stable performance";
        if (score >= -0.5) return "Neutral / Learning Phase";
        return "Requires conscious handling";
    }

    private static calculateLoad(planet: string, influences: string[], pressures: string[], role: string): number {
        let load = 0;
        load += influences.length; // Conjunctions
        load += pressures.length;  // Aspects

        if (role === "Functional Malefic") load += 1;
        if (role === "Mixed - Challenge & Growth") load += 0.5;

        return load;
    }

    private static classifyLoad(load: number): string {
        if (load <= 2) return "Under-utilised";
        if (load <= 4) return "Balanced";
        if (load <= 6) return "Overloaded";
        return "Highly Pressured";
    }

    private static synthesize(planet: string, house: number, sign: string, dignity: string, load: string): any {
        // This is a template-based synthesis that AI can expand upon
        return {
            theme: PLANET_THEMES[planet]?.split(',')[0] || 'Life energy',
            acts_in: HOUSE_DOMAINS[house] || 'Specific life areas',
            feels_like: SIGN_TONES[sign] || 'Unique vibration',
            strength: `${dignity} and ${load}`,
            challenge: load === 'Highly Pressured' ? "Potential for burnout or over-effort" : "Integration into daily life",
            repeats_when: "Awareness is dimmed by habit",
            balances_with: "Conscious observation and pacing"
        };
    }
}
