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
        const { name, dateOfBirth, timeOfBirth, placeOfBirth, latitude, longitude, timezone, chartData } = body;

        if (!name || !dateOfBirth || !placeOfBirth) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
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
                chartData: chartData || {},
            },
        });

        return NextResponse.json(profile, { status: 201 });
    } catch (error) {
        console.error('Failed to create profile:', error);
        return NextResponse.json(
            { error: 'Failed to create profile' },
            { status: 500 }
        );
    }
}
