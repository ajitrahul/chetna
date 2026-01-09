import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generatePlanetInsights } from '@/lib/ai/geminiService';
import { ChartData } from '@/lib/astrology/calculator';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { chartData, chartName } = await req.json();

        if (!chartData || !chartName) {
            return NextResponse.json({ error: 'Missing chart data or name' }, { status: 400 });
        }

        const insights = await generatePlanetInsights(chartData as ChartData, chartName);

        return NextResponse.json({ insights });

    } catch (error: any) {
        console.error('Planet insights error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
