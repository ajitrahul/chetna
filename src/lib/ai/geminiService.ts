import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChartData } from '../astrology/calculator';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export interface ClarityResponse {
    questionContext: string;
    phaseOverview: string;
    patternInsights: string[];
    actionGuidance: string[];
    reflectiveQuestions: string[];
    ethicalClosing: string;
}

export interface SynastryResponse {
    connectionOverview: string;
    magneticPull: string;
    growthEdges: string[];
    communicationFlow: string;
    harmonyTips: string[];
}

export interface JournalAnalysis {
    correlation: string;
    astrologicalContext: string;
    growthSuggestion: string;
}

export async function generateJournalAnalysis(
    content: string,
    chartData: ChartData,
    currentDasha: { lord: string, antardasha: string }
): Promise<JournalAnalysis> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const systemPrompt = `You are an insightful Vedic astrologer correlating personal reflections with planetary patterns.
User wrote: "${content}"

Current Timing: ${currentDasha.lord} Mahadasha, ${currentDasha.antardasha} Antardasha.
Chart Snapshot: ${JSON.stringify(chartData, null, 2)}

TASK:
1. CORRELATION: How does their internal mood/experience correlate with the current timing lord or house patterns? (2 sentences)
2. ASTROLOGICAL CONTEXT: Explain the nature of this current phase's energy (e.g., "Jupiter expands", "Saturn disciplines").
3. GROWTH SUGGESTION: One practical, awareness-based way they can work WITH this energy based on what they wrote.

Keep it brief (under 150 words total). Focus on mirroring their experience through an astrological lens.`;

    try {
        const result = await model.generateContent(systemPrompt);
        const text = result.response.text();

        return {
            correlation: extractSection(text, 'CORRELATION:', 'ASTROLOGICAL CONTEXT') || "Your current experiences are mirroring a time of significant internal shift.",
            astrologicalContext: extractSection(text, 'ASTROLOGICAL CONTEXT:', 'GROWTH SUGGESTION') || "The current planetary phase emphasizes structural growth and emotional grounding.",
            growthSuggestion: extractSection(text, 'GROWTH SUGGESTION:') || "Reflect on how your recent observations invite you to practice more patience."
        };
    } catch (error) {
        console.error('Gemini Journal error:', error);
        throw new Error('Failed to analyze journal entry');
    }
}

export async function generateSynastryResponse(
    chartA: ChartData,
    chartB: ChartData,
    names: { a: string, b: string }
): Promise<SynastryResponse> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const systemPrompt = `You are an ethical Vedic astrologer specializing in relationship dynamics (Synastry).
Focus on "Awareness, not prediction". Help ${names.a} and ${names.b} understand the energy between them.

CORE PHILOSOPHY:
- No "soulmate" or "doomed" labels
- Focus on how their energies interact and what growth is available
- Use tentative language

RESPONSE STRUCTURE (JSON-like sections):
1. OVERVIEW: A 2-3 sentence high-level summary of their energetic connection.
2. MAGNETIC PULL: What naturally draws them together? (Emotional/Spiritual/Intellectual)
3. GROWTH EDGES (List 2-3): Where do they challenge each other? What are the friction points?
4. COMMUNICATION: How do their Mercuries or houses of speech interact?
5. HARMONY TIPS (List 3): Practical ways to nurture this specific connection.

CHART A (${names.a}):
${JSON.stringify(chartA, null, 2)}

CHART B (${names.b}):
${JSON.stringify(chartB, null, 2)}

Return the response organized clearly.`;

    try {
        const result = await model.generateContent(systemPrompt);
        const text = result.response.text();

        return {
            connectionOverview: extractSection(text, 'OVERVIEW:', 'MAGNETIC PULL') || "A unique blend of energies that invites mutual exploration and conscious mirroring.",
            magneticPull: extractSection(text, 'MAGNETIC PULL:', 'GROWTH EDGES') || "There is a natural resonance that allows for deep understanding and shared values.",
            growthEdges: extractBulletPoints(text, 'GROWTH EDGES:', 'COMMUNICATION') || ["Balancing individual needs with relationship goals", "Navigating different paces of action"],
            communicationFlow: extractSection(text, 'COMMUNICATION:', 'HARMONY TIPS') || "Communication flows best when both parties remain open to different perspectives and styles.",
            harmonyTips: extractBulletPoints(text, 'HARMONY TIPS:') || ["Practice active listening", "Honor each other's individual space", "Communicate through small gestures of appreciation"]
        };
    } catch (error) {
        console.error('Gemini Synastry error:', error);
        throw new Error('Failed to generate synastry response');
    }
}

export async function generateClarityResponse(
    question: string,
    chartData: ChartData
): Promise<ClarityResponse> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const systemPrompt = `You are an ethical Vedic astrologer focused on awareness and empowerment.

CORE PHILOSOPHY:
- Astrology shows PATTERNS and TENDENCIES, not fixed outcomes
- Focus on psychological insights and timing awareness
- Never make predictions or guarantees
- Support free will and conscious choice
- Use tentative language: "tends to", "often", "may" (never "will", "must", "always")

RESPONSE STRUCTURE (6 sections - CRITICAL):

SECTION B - Current Phase Overview:
- 2-3 sentences summarizing the astrological phase
- Neutral, factual tone
- Mention the current Mahadasha/Antardasha theme if provided

SECTION C - Pattern Insights (4-5 bullet points):
- Start with "This phase highlights..."
- Psychological patterns this question reveals
- Situational tendencies active now
- Deep Insights: Use D9 (Navamsha) data to explain the "inner strength" or hidden potential of key planets related to the question.
- Each point starts with a tendency phrase

SECTION D - Action Guidance (4-5 bullet points - MOST VALUABLE):
- Concrete actions that work WITH the patterns
- What supports clarity vs. confusion
- Behavioral choices that improve outcomes
- End with "These are actions, not predictions"

SECTION E - Reflective Questions (3 questions):
- Questions that deepen self-awareness
- Prompt user to examine motivations
- Support conscious decision-making

SECTION F - Ethical Closing (1 sentence):
- "This guidance reflects tendencies, not certainty. Outcomes depend on awareness and action."

CHART DATA PROVIDED:
${JSON.stringify(chartData, null, 2)}

VIMSOTTARI DASHAS (Current Timing):
${JSON.stringify(chartData.dashas?.filter(d => d.isCurrent), null, 2)}

USER QUESTION:
${question}

Vedic Context: Remember D1 is the outer manifestation (the tree), while D9 (Navamsha) represents the inner strength and spiritual fruit. Use both to provide depth.
Generate response following the 6-section structure EXACTLY.`;

    try {
        const result = await model.generateContent(systemPrompt);
        const response = result.response;
        const text = response.text();

        // Parse the AI response into structured format
        // This is a simplified parser - you may want to make it more robust
        const parsed = parseGeminiResponse(text, question);

        return parsed;
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to generate clarity response');
    }
}

function parseGeminiResponse(text: string, question: string): ClarityResponse {
    // Parse sections from Gemini's response
    // This is a basic implementation - adjust based on actual Gemini output format

    return {
        questionContext: question,
        phaseOverview: extractSection(text, 'SECTION B', 'SECTION C') ||
            "This phase emphasizes awareness and conscious choice. Patterns are emerging that invite reflection rather than reaction.",

        patternInsights: extractBulletPoints(text, 'SECTION C', 'SECTION D') || [
            "Tendency to revisit familiar patterns",
            "Need for structure and clarity",
            "Importance of mindful communication",
            "This is a phase for observation over action"
        ],

        actionGuidance: extractBulletPoints(text, 'SECTION D', 'SECTION E') || [
            "Choose awareness over automatic reactions",
            "Create space before responding",
            "Seek understanding rather than quick solutions",
            "These are suggestions, not requirements"
        ],

        reflectiveQuestions: extractBulletPoints(text, 'SECTION E', 'SECTION F') || [
            "What am I trying to control here?",
            "What response honors my values?",
            "Where can patience serve me better?"
        ],

        ethicalClosing: extractSection(text, 'SECTION F') ||
            "This guidance reflects tendencies, not certainty. Outcomes depend on awareness and action."
    };
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

    // Match bullet points with various formats (-, *, •, numbers)
    const bullets = section.match(/^[\s]*[-*•\d.]+\s+(.+)$/gm);
    return bullets ? bullets.map(b => b.replace(/^[\s]*[-*•\d.]+\s+/, '').trim()) : [];
}

// Safety filter to detect unsafe questions
export function isQuestionSafe(question: string): { safe: boolean; reason?: string } {
    const lowerQuestion = question.toLowerCase();

    const unsafePatterns = [
        { pattern: /when will (i|he|she|they) die/i, reason: 'Questions about death are not supported' },
        { pattern: /will (i|he|she|they) get (cancer|disease|sick)/i, reason: 'Medical predictions are not provided' },
        { pattern: /should i (divorce|leave|break up)/i, reason: 'Major life decisions require professional counseling, not astrology' },
        { pattern: /lottery|gambling|stocks/i, reason: 'Financial predictions are not provided' },
        { pattern: /pregnancy|pregnant/i, reason: 'Medical questions require a healthcare provider' },
    ];

    for (const { pattern, reason } of unsafePatterns) {
        if (pattern.test(lowerQuestion)) {
            return { safe: false, reason };
        }
    }

    return { safe: true };
}
