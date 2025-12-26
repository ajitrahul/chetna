import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

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
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { error: 'No profile IDs provided' },
                { status: 400 }
            );
        }

        // Verify all profiles belong to the user and are NOT active
        const profiles = await prisma.profile.findMany({
            where: {
                id: { in: ids },
                userId: session.user.id,
            },
            select: {
                id: true,
                isActive: true,
            },
        });

        if (profiles.length !== ids.length) {
            return NextResponse.json(
                { error: 'Some profiles were not found' },
                { status: 404 }
            );
        }

        // Check if any of them are active
        const hasActive = (profiles as any[]).some(p => p.isActive);
        if (hasActive) {
            return NextResponse.json(
                { error: 'Cannot delete active profiles in bulk' },
                { status: 400 }
            );
        }

        // Delete the profiles
        const deleteResult = await prisma.profile.deleteMany({
            where: {
                id: { in: ids },
                userId: session.user.id,
                isActive: false, // Double safety
            } as any,
        });

        return NextResponse.json({
            success: true,
            message: `${(deleteResult as any).count} profiles deleted successfully`,
            count: (deleteResult as any).count
        });
    } catch (error) {
        console.error('Failed to bulk delete profiles:', error);
        return NextResponse.json(
            { error: 'Failed to bulk delete profiles' },
            { status: 500 }
        );
    }
}
