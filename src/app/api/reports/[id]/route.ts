import { NextRequest, NextResponse } from 'next/server';
// Triggering rebuild for latest schema
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Fetch profile with its report
        const profile = await prisma.profile.findUnique({
            where: {
                id: id,
                userId: session.user.id // Security check
            },
            include: {
                report: true
            }
        });

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        // If no report exists yet, create a pending one
        let report = profile.report;
        if (!report) {
            report = await prisma.report.create({
                data: {
                    profileId: id,
                    status: 'pending'
                }
            });
        }

        return NextResponse.json({
            profile: {
                name: profile.name,
                chartData: profile.chartData,
                gender: profile.gender,
                dob: profile.dateOfBirth,
                tob: profile.timeOfBirth,
                pob: profile.placeOfBirth
            },
            report: {
                status: report.status,
                content: report.content
            }
        });
    } catch (error) {
        console.error('Failed to fetch report:', error);
        return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
    }
}
