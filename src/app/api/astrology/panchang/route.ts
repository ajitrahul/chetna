import { NextRequest, NextResponse } from 'next/server';
import { calculatePanchang } from '@/lib/astrology/calculator';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({
                error: 'Unauthorized',
                code: 'AUTH_REQUIRED'
            }, { status: 401 });
        }

        // Fetch User Profile for Coordinates
        const profile = await prisma.profile.findFirst({
            where: { userId: session.user.id }
        });

        if (!profile) {
            return NextResponse.json({
                error: 'Profile not found. Please complete onboarding.',
                code: 'PROFILE_MISSING'
            }, { status: 404 });
        }

        const lat = profile.latitude;
        const lng = profile.longitude;

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
