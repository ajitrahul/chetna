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

        // Disable ALL existing active profiles for this user (only one active profile allowed)
        await prisma.profile.updateMany({
            where: {
                userId: session.user.id,
                isActive: true,
            },
            data: {
                isActive: false,
                disabledAt: new Date(),
                disabledReason: 'Replaced by new active profile',
            },
        } as any);

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
