import { NextRequest, NextResponse } from 'next/server';
import { calculateChart, getZodiacSign } from '@/lib/astrology/calculator';

export async function GET(req: NextRequest) {
    try {
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = now.getUTCMonth() + 1;
        const day = now.getUTCDate();
        const hour = now.getUTCHours() + (now.getUTCMinutes() / 60);

        // Calculate for 0,0 (Global/Cosmic weather doesn't depend heavily on local houses for just planet positions, 
        // but we'll use a neutral location for general sign placement)
        const chartData = await calculateChart(year, month, day, hour, 0, 0);

        const moonPos = chartData.planets['Moon'].longitude;
        const moonSign = getZodiacSign(moonPos);

        const themes: Record<string, { theme: string, prompt: string }> = {
            'Aries': { theme: 'Active Initiative', prompt: 'Where is your intuition pushing you to start something new today?' },
            'Taurus': { theme: 'Steady Presence', prompt: 'What small physical comfort can you fully appreciate right now?' },
            'Gemini': { theme: 'Curious Exchange', prompt: 'What is one new perspective you encountered today?' },
            'Cancer': { theme: 'Nurturing Flow', prompt: 'How are you protecting your inner softness today?' },
            'Leo': { theme: 'Radiant Expression', prompt: 'What part of your heart is asking to be seen?' },
            'Virgo': { theme: 'Refined Focus', prompt: 'What small chaos can you gently bring into order today?' },
            'Libra': { theme: 'Balanced Connection', prompt: 'Where is a bridge needing to be built in your life right now?' },
            'Scorpio': { theme: 'Deep Integration', prompt: 'What truth are you finally ready to look at?' },
            'Sagittarius': { theme: 'Expansive Vision', prompt: 'What belief is feeling too small for you lately?' },
            'Capricorn': { theme: 'Grounded Authority', prompt: 'What responsibility feels like a privilege today?' },
            'Aquarius': { theme: 'Collective Insight', prompt: 'How are you different from the crowd in a way that helps the crowd?' },
            'Pisces': { theme: 'Soulful Release', prompt: 'What are you letting go of to make room for the new?' }
        };

        const currentTheme = themes[moonSign] || themes['Pisces'];

        return NextResponse.json({
            transit: `Moon in ${moonSign}`,
            theme: currentTheme.theme,
            prompt: currentTheme.prompt,
            timestamp: now.toISOString()
        });
    } catch (error: any) {
        console.error('Transit API error:', error);
        return NextResponse.json({
            error: 'Failed to calculate transit',
            details: error.message
        }, { status: 500 });
    }
}
