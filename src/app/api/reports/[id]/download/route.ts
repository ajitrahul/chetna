import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { generateReportPDF } from '@/lib/pdf';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id } = await params;

        // 1. Fetch report and verify ownership
        const report = await prisma.report.findUnique({
            where: { profileId: id },
            include: { profile: true }
        });

        if (!report || report.status !== 'generated' || !report.content) {
            return new NextResponse('Report not ready or missing', { status: 404 });
        }

        if (report.profile.userId !== session.user.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // 2. Generate PDF from stored content
        const pdfBuffer = await generateReportPDF(report.profile.name, report.content as any, report.profile.chartData);

        // 3. Return as downloadable file
        return new NextResponse(new Uint8Array(pdfBuffer), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="Chetna_Life_Report_${report.profile.name}.pdf"`,
            }
        });

    } catch (error) {
        console.error('Download error:', error);
        return new NextResponse('Failed to generate download', { status: 500 });
    }
}
