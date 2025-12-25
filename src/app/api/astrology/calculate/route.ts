import { NextRequest, NextResponse } from 'next/server';
import { calculateChart } from '@/lib/astrology/calculator';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
    let body: any;
    try {
        const session = await auth();
        // Allow guest calculation? For now let's keep it protected or semi-protected

        body = await req.json();
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

        const chartData = await calculateChart(
            parseInt(year),
            parseInt(month),
            parseInt(day),
            decimalHour,
            parseFloat(lat),
            parseFloat(lng),
            timezone ? parseFloat(timezone) : 5.5 // Default to IST logic if not provided
        );

        return NextResponse.json(chartData);
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
