import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const profiles = await prisma.profile.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(profiles);
    } catch (error) {
        console.error('Failed to fetch profiles:', error);
        return NextResponse.json(
            { error: 'Failed to fetch profiles' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { name, dateOfBirth, timeOfBirth, placeOfBirth, latitude, longitude, timezone, gender, chartData } = body;

        if (!name || !dateOfBirth || !placeOfBirth || !gender) {
            return NextResponse.json(
                { error: 'Missing required fields (name, dob, pob, gender)' },
                { status: 400 }
            );
        }

        // Get current active profiles
        const activeProfiles = await prisma.profile.findMany({
            where: {
                userId: session.user.id,
                isActive: true,
            },
            orderBy: { createdAt: 'asc' }, // Oldest first
        });

        // Get max allowed active profiles from env (default: 5)
        const maxActiveProfiles = parseInt(process.env.MAX_ACTIVE_PROFILES || '5');

        // If at or over limit, deactivate the oldest profile(s)
        if (activeProfiles.length >= maxActiveProfiles) {
            const profilesToDeactivate = activeProfiles.slice(0, activeProfiles.length - maxActiveProfiles + 1);

            for (const profile of profilesToDeactivate) {
                await prisma.profile.update({
                    where: { id: profile.id },
                    data: {
                        isActive: false,
                        disabledAt: new Date(),
                        disabledReason: `Exceeded max active profiles limit (${maxActiveProfiles})`,
                    },
                } as any);
            }
        }

        const profile = await prisma.profile.create({
            data: {
                userId: session.user.id,
                name,
                dateOfBirth: new Date(dateOfBirth),
                timeOfBirth,
                placeOfBirth,
                latitude,
                longitude,
                timezone: timezone || 'UTC',
                gender,
                chartData: chartData || {},
                isActive: true,
            },
        } as any);

        return NextResponse.json(profile, { status: 201 });
    } catch (error) {
        console.error('Failed to create profile:', error);
        if (error instanceof Error) {
            console.error('Error stack:', error.stack);
        }
        return NextResponse.json(
            { error: 'Failed to create profile' },
            { status: 500 }
        );
    }
}
