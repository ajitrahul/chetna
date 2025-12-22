import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export interface ClarityResponse {
    questionContext: string;
    phaseOverview: string;
    patternInsights: string[];
    actionGuidance: string[];
    reflectiveQuestions: string[];
    ethicalClosing: string;
}

export async function generateClarityResponse(
    question: string,
    chartData: any
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
- No predictions, just capacity/resistance themes

SECTION C - Pattern Insights (4-5 bullet points):
- Start with "This phase highlights..."
- Psychological patterns this question reveals
- Situational tendencies active now
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

USER QUESTION:
${question}

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

    const sections = text.split(/Section [A-F]:/i);

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

function extractBulletPoints(text: string, startMarker: string, endMarker: string): string[] {
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
