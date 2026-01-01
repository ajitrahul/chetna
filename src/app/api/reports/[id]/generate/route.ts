import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { generateReportChapters } from '@/lib/ai/geminiService';
import { sendLifeReportEmail } from '@/lib/mail';
import { generateReportPDF } from '@/lib/pdf';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // 1. Verify report is purchased and profile exists
        const report = await prisma.report.findUnique({
            where: { profileId: id },
            include: { profile: true }
        });

        if (!report || (report.status !== 'purchased' && report.status !== 'generated')) {
            return NextResponse.json({ error: 'Report not purchased or profile missing' }, { status: 403 });
        }

        if (report.profile.userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Generate content using Gemini
        const content = await generateReportChapters({
            name: report.profile.name,
            gender: report.profile.gender,
            chartData: report.profile.chartData as any
        });

        // 3. Save content and update status
        const updatedReport = await prisma.report.update({
            where: { profileId: id },
            data: {
                status: 'generated',
                content: content as any
            }
        });

        // 4. Generate PDF and Send Email (non-blocking)
        const userEmail = session.user?.email;
        if (userEmail) {
            (async () => {
                try {
                    const pdfBuffer = await generateReportPDF(report.profile.name, content as any, report.profile.chartData);
                    await sendLifeReportEmail(userEmail, report.profile.name, content, pdfBuffer);
                } catch (err) {
                    console.error('Post-generation processing failed:', err);
                }
            })();
        }

        return NextResponse.json({
            success: true,
            content: updatedReport.content
        });

    } catch (error: any) {
        console.error('Generation error:', error);
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }
}
