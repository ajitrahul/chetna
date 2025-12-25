import { NextRequest, NextResponse } from 'next/server';
import { calculateChart } from '@/lib/astrology/calculator';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
    let body: {
        year: string;
        month: string;
        day: string;
        hour: number;
        minute: number;
        lat: string;
        lng: string;
        timezone?: string;
    } | undefined;
    try {
        // Try to get session, but don't let it fail the whole route if auth is misconfigured
        try {
            await auth();
        } catch (e) {
            console.error('Auth check failed in calculation route:', e);
        }

        body = await req.json();
        if (!body) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }
        const { year, month, day, hour, minute, lat, lng, timezone } = body;

        if (!year || !month || !day || lat === undefined || lng === undefined) {
            return NextResponse.json(
                { error: 'Missing required birth details (date, lat, lng)' },
                { status: 400 }
            );
        }

        // Convert hour/minute to decimal hour in UTC
        // Note: User should handle timezone offset before sending or we calculate here
        // For simplicity, let's assume body includes 'timezone' and handles UTC conversion
        const decimalHour = hour + (minute / 60);

        // 1. Calculate Birth Chart
        const chartData = await calculateChart(
            parseInt(year),
            parseInt(month),
            parseInt(day),
            decimalHour,
            parseFloat(lat),
            parseFloat(lng),
            timezone ? parseFloat(timezone) : 5.5
        );

        // 2. Calculate Transit Chart (Current Moments)
        const now = new Date();
        const tYear = now.getFullYear();
        const tMonth = now.getMonth() + 1;
        const tDay = now.getDate();
        const tHour = now.getHours() + (now.getMinutes() / 60);

        const transitData = await calculateChart(
            tYear,
            tMonth,
            tDay,
            tHour,
            parseFloat(lat),
            parseFloat(lng),
            timezone ? parseFloat(timezone) : 5.5 // Use same timezone
        );

        return NextResponse.json({ ...chartData, transits: transitData });
    } catch (error) {
        console.error('Calculation error:', error);
        console.error('Error details:', error instanceof Error ? error.message : String(error));
        console.error('Request body:', body);
        return NextResponse.json(
            {
                error: 'Failed to calculate astrological chart',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
