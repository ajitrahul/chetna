import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { VedicAnalysisEngine } from '@/lib/astrology/engine';
import { ChartData } from '@/lib/astrology/calculator';
import { checkAdminAccess } from '@/lib/admin';

export async function GET() {
    try {
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: 'Not Found' }, { status: 404 });
        }

        if (!await checkAdminAccess()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
