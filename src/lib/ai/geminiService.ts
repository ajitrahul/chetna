import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { ChartData, getNakshatra } from '../astrology/calculator';
import { VedicAnalysisEngine } from '../astrology/engine';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

// DeepSeek Client
const deepseek = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
});

// Official OpenAI Client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Utility to get the correct model name based on provider and complexity
 */
function getModel(feature: 'REPORT' | 'CLARITY' | 'SYNASTRY' | 'JOURNAL') {
    const provider = process.env.AI_PROVIDER || process.env.REPORT_LLM_PROVIDER || 'gemini';
    const strategy = process.env.AI_STRATEGY || 'SINGLE';

    // Default provider mapping for SINGLE mode
    const defaultProvider = process.env.REPORT_LLM_PROVIDER || 'gemini';

    // Best-of-Breed Mapping for HYBRID mode
    const bestOfBreed = {
        REPORT: { provider: 'gemini', model: 'gemini-2.5-pro' },   // Narrative depth
        CLARITY: { provider: 'openai', model: 'gpt-4o' },         // Logical reasoning
        SYNASTRY: { provider: 'gemini', model: 'gemini-2.5-pro' }, // Poetic empathy
        JOURNAL: { provider: 'deepseek', model: 'deepseek-chat' } // Performance/Cost
    };

    if (strategy === 'HYBRID') {
        const result = bestOfBreed[feature];
        // Fallback check: if the required API key is missing, fallback to gemini
        if (result.provider === 'openai' && !process.env.OPENAI_API_KEY) return { provider: 'gemini', modelName: 'gemini-2.5-pro' };
        if (result.provider === 'deepseek' && !process.env.DEEPSEEK_API_KEY) return { provider: 'gemini', modelName: 'gemini-2.5-flash' };
        return { provider: result.provider, modelName: result.model };
    }

    // SINGLE mode logic
    const config = {
        gemini: {
            HIGH: 'gemini-2.5-pro',
            STANDARD: 'gemini-2.5-flash'
        },
        openai: {
            HIGH: 'gpt-4o',
            STANDARD: 'gpt-4o-mini'
        },
        deepseek: {
            HIGH: 'deepseek-chat', // maps to V3 model
            STANDARD: 'deepseek-chat'
        }
    };

    const complexity = (feature === 'REPORT' || feature === 'CLARITY' || feature === 'SYNASTRY') ? 'HIGH' : 'STANDARD';
    return {
        provider: provider,
        modelName: config[provider as keyof typeof config]?.[complexity] || config.gemini[complexity]
    };
}

/**
 * Generic caller for different providers
 */
async function callAI(prompt: string, feature: 'REPORT' | 'CLARITY' | 'SYNASTRY' | 'JOURNAL', isJson: boolean = false) {
    const { provider, modelName } = getModel(feature);

    try {
        if (provider === 'gemini') {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            return isJson ? text.replace(/```json|```/g, "").trim() : text;
        } else {
            const client = provider === 'deepseek' ? deepseek : openai;
            const response = await client.chat.completions.create({
                model: modelName,
                messages: [{ role: "user", content: prompt }],
                ...(isJson && { response_format: { type: 'json_object' } })
            });
            return response.choices[0].message.content || "";
        }
    } catch (error: any) {
        const isQuotaError = error.status === 429 || error.message?.includes('429') || error.message?.includes('quota');
        console.error(`${provider.toUpperCase()} AI Error:`, error);

        // If we hit a quota limit and we have a secondary provider available, try a high-quality fallback
        if (isQuotaError && provider === 'gemini' && process.env.OPENAI_API_KEY) {
            console.warn("Gemini Quota hit. Attempting premium fallback to OpenAI GPT-4o...");
            const secondaryClient = openai;
            const response = await secondaryClient.chat.completions.create({
                model: 'gpt-4o',
                messages: [{ role: "user", content: prompt }],
                ...(isJson && { response_format: { type: 'json_object' } })
            });
            return response.choices[0].message.content || "";
        }

        if (isQuotaError) {
            throw new Error(`AI Quota Exceeded (${provider}). Please enable billing in your AI Dashboard or wait a minute.`);
        }

        throw error;
    }
}

export interface ClarityResponse {
    questionContext: string;
    phaseOverview: string;
    decisionTreeSteps: string[];
    finalVerdict: 'ACT' | 'WAIT' | 'REDIRECT' | string;
    patternInsights: string[];
    actionGuidance: string[];
    reflectiveQuestions: string[];
    ethicalClosing: string;
}

export type SynastryResponse = {
    connectionOverview: string;
    magneticPull: string;
    growthEdges: string[];
    communicationFlow: string;
    harmonyTips: string[];
};

export type PlanetInsights = Record<string, string>;

export interface JournalAnalysis {
    correlation: string;
    astrologicalContext: string;
    growthSuggestion: string;
}

export interface TimingInsight {
    phaseFlavor: string;
    opportunityArea: string;
    awarenessPractice: string;
}

/**
 * 1. TIMING (DASHA) INSIGHT
 */
export async function generateTimingInsight(
    chartData: ChartData,
    currentDasha: { lord: string, start: string, end: string }
): Promise<TimingInsight> {
    const sanitizedChart = sanitizeChartData(chartData);
    const analysis = VedicAnalysisEngine.analyze(chartData);

    const prompt = `You are a Vedantic Sage. Provide a deeply personal "Cosmic Weather" report for the user's current life phase.
    "Awareness, not prediction".
    
    CURRENT PHASE: ${currentDasha.lord} Mahadasha
    TIME RANGE: ${currentDasha.start} to ${currentDasha.end}
    
    USER CHART: ${JSON.stringify(sanitizedChart, null, 2)}
    PERSONALIZED ANALYSIS: ${JSON.stringify(analysis, null, 2)}
    
    TASK:
    Generate 3 specific sections based on how ${currentDasha.lord} behaves in THEIR specific chart (house, sign, nakshatra, and functional role).
    
    1. PHASE_FLAVOR: A 100-word poetic yet practical description of the current energy. How is ${currentDasha.lord} specifically affecting their consciousness right now?
    2. OPPORTUNITY: One specific area of life where they have the most 'celestial tailwind' to act right now.
    3. AWARENESS_PRACTICE: A micro-habit or reflective question tailored to this specific planetary transit.
    
    Return with headers PHASE_FLAVOR:, OPPORTUNITY:, AWARENESS_PRACTICE:. Keep it under 250 words total. Avoid boilerplate.`;

    try {
        const text = await callAI(prompt, 'CLARITY');
        return {
            phaseFlavor: extractSection(text, 'PHASE_FLAVOR:', 'OPPORTUNITY') || "A period of internal refinement.",
            opportunityArea: extractSection(text, 'OPPORTUNITY:', 'AWARENESS_PRACTICE') || "Focus on personal growth.",
            awarenessPractice: extractSection(text, 'AWARENESS_PRACTICE:') || "Practice mindful observation."
        };
    } catch (error) {
        throw new Error('Failed to generate timing insight');
    }
}

/**
 * 1. JOURNAL ANALYSIS
 */
export async function generateJournalAnalysis(
    content: string,
    chartData: ChartData,
    currentDasha: { lord: string, antardasha: string }
): Promise<JournalAnalysis> {
    const sanitizedChart = sanitizeChartData(chartData);
    const prompt = `You are an insightful Vedic astrologer correlating personal reflections with planetary patterns.
User wrote: "${content}"

Current Timing: ${currentDasha.lord} Mahadasha, ${currentDasha.antardasha} Antardasha.
Chart Snapshot: ${JSON.stringify(sanitizedChart, null, 2)}
Detailed Analysis: ${JSON.stringify(VedicAnalysisEngine.analyze(chartData), null, 2)}

TASK:
1. CORRELATION: How does their internal mood/experience correlate with the current timing lord or house patterns? (2 sentences)
2. ASTROLOGICAL CONTEXT: Explain the nature of this current phase's energy (e.g., "Jupiter expands", "Saturn disciplines").
3. GROWTH SUGGESTION: One practical, awareness-based way they can work WITH this energy based on what they wrote.

Keep it brief (under 150 words total). Return the sections clearly marked with the headers CORRELATION:, ASTROLOGICAL CONTEXT:, and GROWTH SUGGESTION:.`;

    try {
        const text = await callAI(prompt, 'JOURNAL');
        return {
            correlation: extractSection(text, 'CORRELATION:', 'ASTROLOGICAL CONTEXT') || "Reflecting your internal shift.",
            astrologicalContext: extractSection(text, 'ASTROLOGICAL CONTEXT:', 'GROWTH SUGGESTION') || "Planetary phase of grounding.",
            growthSuggestion: extractSection(text, 'GROWTH SUGGESTION:') || "Practice patience today."
        };
    } catch (error) {
        throw new Error('Failed to analyze journal');
    }
}

/**
 * 2. SYNASTRY (RELATIONSHIP)
 */
export async function generateSynastryResponse(
    chartA: ChartData,
    chartB: ChartData,
    names: { a: string, b: string }
): Promise<SynastryResponse> {
    const sanitizedA = sanitizeChartData(chartA);
    const sanitizedB = sanitizeChartData(chartB);
    const prompt = `You are an ethical Vedic astrologer specializing in relationship dynamics.
"Awareness, not prediction". Help ${names.a} and ${names.b} understand their interaction.

RESPONSE STRUCTURE:
1. OVERVIEW: High-level summary.
2. MAGNETIC PULL: Natural draw.
3. GROWTH EDGES (List): Friction points.
4. COMMUNICATION: Mercury/speech interaction.
5. HARMONY TIPS (List): Practical advice.

CHART A: ${JSON.stringify(sanitizedA, null, 2)}
CHART B: ${JSON.stringify(sanitizedB, null, 2)}
ANALYSIS A: ${JSON.stringify(VedicAnalysisEngine.analyze(chartA), null, 2)}
ANALYSIS B: ${JSON.stringify(VedicAnalysisEngine.analyze(chartB), null, 2)}

Return sections with headers OVERVIEW:, MAGNETIC PULL:, GROWTH EDGES:, COMMUNICATION:, HARMONY TIPS:.`;

    try {
        const text = await callAI(prompt, 'SYNASTRY');
        return {
            connectionOverview: extractSection(text, 'OVERVIEW:', 'MAGNETIC PULL') || "Unique energetic blend.",
            magneticPull: extractSection(text, 'MAGNETIC PULL:', 'GROWTH EDGES') || "Natural resonance exists.",
            growthEdges: extractBulletPoints(text, 'GROWTH EDGES:', 'COMMUNICATION') || ["Balancing needs"],
            communicationFlow: extractSection(text, 'COMMUNICATION:', 'HARMONY TIPS') || "Open styles support flow.",
            harmonyTips: extractBulletPoints(text, 'HARMONY TIPS:') || ["Active listening"]
        };
    } catch (error) {
        console.error('Synastry AI error:', error);
        return {
            connectionOverview: "A cosmic connection is forming...",
            magneticPull: "Stable",
            growthEdges: ["Communication"],
            harmonyTips: ["Patience"]
        } as SynastryResponse;
    }
}

/**
 * 4. PLANET INSIGHTS (DETAILED PLACEMENT ANALYSIS)
 */
export async function generatePlanetInsights(
    chartData: ChartData,
    chartName: string
): Promise<PlanetInsights> {
    const sanitizedChart = sanitizeChartData(chartData);
    const analysis = VedicAnalysisEngine.analyze(chartData);

    const prompt = `You are a Master Vedic Astrologer. Provide ultra-detailed, empathetic insights for EACH planet in the ${chartName} chart.
    "Awareness, not prediction". Focus on psychological patterns, reactive habits, and awareness triggers.
    
    CHART DATA: ${JSON.stringify(sanitizedChart, null, 2)}
    ANALYSIS DATA: ${JSON.stringify(analysis, null, 2)}
    
    RETURN A JSON OBJECT where:
    - Keys are planet names (Sun, Moon, Mars, etc.)
    - Values are 150-200 word deep-dives explaining the planet's specific "State of consciousness" in this department (${chartName}).
    - MANDATORY: You MUST explicitly mention the planet's Nakshatra, its Pada, and its precise degree in your narrative.
    - Analyze the Functional Role (Benefic/Malefic/Mixed) and how it affects the specific house domain.
    - Use the provided LOAD and SYNTHESIS metrics to ground your explanation.
    - Format: { "Sun": "...", "Moon": "...", ... }
    
    Return ONLY valid JSON. Keep the tone empathetic, awareness-focused, and deeply technical yet accessible. Avoid generic filler. Every profile's insight MUST feel unique based on these specific calculations.`;

    try {
        const text = await callAI(prompt, 'CLARITY'); // Using 'CLARITY' settings for moderate cost/speed
        // Robust JSON parsing
        const cleanJson = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error('Planet Insights AI error:', error);
        // Fallback: return empty or basic strings if AI fails
        return {};
    }
}

/**
 * 3. CLARITY (SEARCH)
 */
export async function generateClarityResponse(
    question: string,
    chartData: ChartData
): Promise<ClarityResponse> {
    const sanitizedChart = sanitizeChartData(chartData);
    const prompt = `Vedic Astrologer. Focus on patterns and tendencies.
    
CHART DATA: ${JSON.stringify(sanitizedChart, null, 2)}
TIMING: ${JSON.stringify(sanitizedChart.dashas?.find((d: any) => d.isCurrent), null, 2)}
QUESTION: ${question}

ADDITIONAL ANALYSIS (LOAD & PATTERNS):
${JSON.stringify(VedicAnalysisEngine.analyze(chartData), null, 2)}

STRUCTURE:
SECTION B - Phase Overview
SECTION BA - The Decision Tree (Result: ACT/WAIT/REDIRECT)
SECTION C - Pattern Insights (Bullets)
SECTION D - Action Guidance (Bullets)
SECTION E - Reflective Questions (Bullets)
SECTION F - Ethical Closing`;

    try {
        const text = await callAI(prompt, 'CLARITY');
        const finalVerdictMatch = text.match(/FINAL VERDICT:\s*(ACT|WAIT|REDIRECT)/i);
        const finalVerdict = finalVerdictMatch ? finalVerdictMatch[1].toUpperCase() : 'WAIT';

        return {
            questionContext: question,
            phaseOverview: extractSection(text, 'SECTION B', 'SECTION BA') || "Patterns of conscious choice.",
            decisionTreeSteps: extractBulletPoints(text, 'SECTION BA', 'FINAL VERDICT') || ["Analyzing timing..."],
            finalVerdict,
            patternInsights: extractBulletPoints(text, 'SECTION C', 'SECTION D') || ["Tendency to revisit familiar patterns"],
            actionGuidance: extractBulletPoints(text, 'SECTION D', 'SECTION E') || ["Choose awareness"],
            reflectiveQuestions: extractBulletPoints(text, 'SECTION E', 'SECTION F') || ["What am I controlling?"],
            ethicalClosing: extractSection(text, 'SECTION F') || "Guidance reflects tendencies."
        };
    } catch (error) {
        throw new Error('Failed to generate clarity');
    }
}

/**
 * 4. PREMIUM LIFE REPORT (Overhauled for 2026 Launch)
 */
export async function generateReportChapters(data: { name: string; gender: string; chartData: any }) {
    const sanitizedChart = sanitizeChartData(data.chartData);

    const promptPart1 = `You are a Master Vedic Sage. Creating PART 1 (Chapters 1-5) of a Premium Life Report for ${data.name}.
    CONTEXT: ${JSON.stringify(sanitizedChart)}
    DETAILED ANALYSIS: ${JSON.stringify(VedicAnalysisEngine.analyze(data.chartData), null, 2)}
    
    RETURN JSON with these keys:
    {
        "chapter1_SoulPurpose": "Inner calling (D9 focus). 500+ words.",
        "chapter2_CareerSuccess": "Professional destiny (D10 focus). 500+ words.",
        "chapter3_LoveAndConnection": "Relationships. 500+ words.",
        "chapter4_HealthAndVitality": "Health & Balance. 500+ words.",
        "chapter5_YearlyHorizon": "Next 12 Months timing. 500+ words."
    }`;

    const promptPart2 = `You are a Master Vedic Sage. Creating PART 2 (Chapters 6-10) of a Premium Life Report for ${data.name}.
    CONTEXT: ${JSON.stringify(sanitizedChart)}
    DETAILED ANALYSIS: ${JSON.stringify(VedicAnalysisEngine.analyze(data.chartData), null, 2)}
    
    RETURN JSON with these keys:
    {
        "chapter6_Strengths": "Core strengths. 400+ words.",
        "chapter7_Bottlenecks": "Shadows & Pitfalls. 400+ words.",
        "chapter8_KarmicLessons": "Spiritual lessons. 400+ words.",
        "chapter9_PracticalWisdom": "Remedies & Rituals. 500+ words.",
        "chapter10_SagesClosing": "Poetic sizing. 300+ words."
    }`;

    try {
        console.log("Starting parallel synthesis for report...");
        const [text1, text2] = await Promise.all([
            callAI(promptPart1, 'REPORT', true),
            callAI(promptPart2, 'REPORT', true)
        ]);

        console.log("Synthesis complete. Parsing...");
        const json1 = JSON.parse(text1);
        const json2 = JSON.parse(text2);

        return { ...json1, ...json2 };
    } catch (error: any) {
        console.error("Cosmic synthesis failed:", error.message || error);
        // Fallback: If one failed, try to return what we have or a partial error
        // But for now, throw detailed error
        throw new Error(`Cosmic synthesis failed: ${error.message}`);
    }
}

/**
 * UTILS
 */
function sanitizeChartData(data: any): any {
    if (!data) return data;

    // 1. Create a lean version of the chart data
    const sanitized: any = {
        ascendant: data.ascendant ? Number(data.ascendant.toFixed(2)) : undefined,
        navamsaAscendant: data.navamsaAscendant,
        planets: {}
    };

    // 2. Sanitize Planets: Keep only essential fields and round values
    if (data.planets) {
        for (const [name, pos] of Object.entries(data.planets as Record<string, any>)) {
            sanitized.planets[name] = {
                longitude: Number(pos.longitude.toFixed(2)),
                isRetrograde: pos.isRetrograde,
                house: pos.house,
                navamsaSign: pos.navamsaSign,
                dignity: pos.dignity,
                nakshatra: getNakshatra(pos.longitude).name
                // Stripped: latitude, distance, speed, latitude_speed etc.
            };
        }
    }

    // 3. Selective Dasha: Only send the CURRENT Mahadasha context
    if (data.dashas) {
        const currentMaha = data.dashas.find((d: any) => d.isCurrent) || data.dashas[0];
        if (currentMaha) {
            sanitized.dashas = [{
                lord: currentMaha.lord,
                start: currentMaha.start,
                end: currentMaha.end,
                isCurrent: true,
                antardashas: currentMaha.antardashas?.map((ad: any) => ({
                    lord: ad.lord,
                    start: ad.start,
                    end: ad.end,
                    isCurrent: ad.isCurrent
                }))
            }];
        }
    }

    // 4. Handle Vargas for deep analysis (D9/D10)
    if (data.vargas) {
        sanitized.vargas = {};
        if (data.vargas.d9) sanitized.vargas.d9 = sanitizeChartData(data.vargas.d9);
        if (data.vargas.d10) sanitized.vargas.d10 = sanitizeChartData(data.vargas.d10);
    }

    return sanitized;
}

function extractSection(text: string, startMarker: string, endMarker?: string): string {
    const startIndex = text.indexOf(startMarker);
    if (startIndex === -1) return '';
    const contentStart = startIndex + startMarker.length;
    const endIndex = endMarker ? text.indexOf(endMarker, contentStart) : text.length;
    return text.substring(contentStart, endIndex !== -1 ? endIndex : text.length).trim();
}

function extractBulletPoints(text: string, startMarker: string, endMarker?: string): string[] {
    const section = extractSection(text, startMarker, endMarker);
    if (!section) return [];
    const bullets = section.match(/^[\s]*[-*•\d.]+\s+(.+)$/gm);
    return bullets ? bullets.map(b => b.replace(/^[\s]*[-*•\d.]+\s+/, '').trim()) : [];
}

export function isQuestionSafe(question: string): { safe: boolean; reason?: string } {
    const lower = question.toLowerCase();
    const unsafe = [
        { pattern: /when will .* die/i, reason: 'Death predictions not supported' },
        { pattern: /cancer|disease|sick|pregnant|pregnancy/i, reason: 'Medical advice not provided' },
        { pattern: /divorce|leave|break up/i, reason: 'Relationship counseling recommended' },
        { pattern: /lottery|gambling|stocks/i, reason: 'Financial predictions not provided' }
    ];
    for (const { pattern, reason } of unsafe) {
        if (pattern.test(lower)) return { safe: false, reason };
    }
    return { safe: true };
}
