import { NextRequest, NextResponse } from 'next/server';
import { calculatePanchang } from '@/lib/astrology/calculator';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const lat = parseFloat(searchParams.get('lat') || '28.6139'); // Default New Delhi
        const lng = parseFloat(searchParams.get('lng') || '77.2090');

        const now = new Date();
        const panchang = await calculatePanchang(
            now.getUTCFullYear(),
            now.getUTCMonth() + 1,
            now.getUTCDate(),
            now.getUTCHours() + now.getUTCMinutes() / 60,
            lat,
            lng
        );

        return NextResponse.json(panchang);
    } catch (error: unknown) {
        console.error('Panchang calculation error:', error);
        return NextResponse.json({
            error: 'Failed to calculate Panchang',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
