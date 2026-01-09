import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { VedicAnalysisEngine } from '@/lib/astrology/engine';
import { ChartData } from '@/lib/astrology/calculator';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const profile = await prisma.profile.findFirst({
            where: { userId: session.user.id, isActive: true },
            orderBy: { createdAt: 'desc' }
        });

        if (!profile) return NextResponse.json({ error: 'No active profile found' }, { status: 404 });

        const analysis = VedicAnalysisEngine.analyze(profile.chartData as unknown as ChartData);

        return NextResponse.json({
            success: true,
            profileName: profile.name,
            analysis: analysis
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
