import { NextResponse } from 'next/server';
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

        const activeProfile = await prisma.profile.findFirst({
            where: {
                userId: session.user.id,
                isActive: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(activeProfile);
    } catch (error) {
        console.error('Failed to fetch active profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch active profile' },
            { status: 500 }
        );
    }
}
