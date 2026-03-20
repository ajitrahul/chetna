import { NextRequest, NextResponse } from 'next/server';
import { calculateChart } from '@/lib/astrology/calculator';
import { VedicAnalysisEngine } from '@/lib/astrology/engine';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = req.nextUrl.searchParams;
        const profileId = searchParams.get('profileId');
        if (!profileId) {
            return NextResponse.json({ error: 'Profile ID required' }, { status: 400 });
        }

        const profile = await prisma.profile.findFirst({
            where: { id: profileId, userId: session.user.id }
        });

        if (!profile || !profile.chartData) {
            return NextResponse.json({ error: 'Profile or Chart Data not found' }, { status: 404 });
        }

        const now = new Date();
        const transitChart = await calculateChart(
            now.getUTCFullYear(),
            now.getUTCMonth() + 1,
            now.getUTCDate(),
            now.getUTCHours() + now.getUTCMinutes() / 60,
            profile.latitude,
            profile.longitude
        );

        const transits = VedicAnalysisEngine.analyzeTransits(profile.chartData as any, transitChart);

        return NextResponse.json({ success: true, transits });
    } catch (error: any) {
        console.error("Transit API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to calculate transits" }, { status: 500 });
    }
}
