import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Find the profile and ensure it belongs to the user
        const profile = await prisma.profile.findUnique({
            where: { id },
            select: { userId: true, isActive: true }
        });

        if (!profile) {
            return NextResponse.json(
                { error: 'Profile not found' },
                { status: 404 }
            );
        }

        if (profile.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        // CRITICAL: Ensure the profile is not active
        if (profile.isActive) {
            return NextResponse.json(
                { error: 'Cannot delete the active profile' },
                { status: 400 }
            );
        }

        // Delete the profile
        await prisma.profile.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: 'Profile deleted successfully' });
    } catch (error) {
        console.error('Failed to delete profile:', error);
        return NextResponse.json(
            { error: 'Failed to delete profile' },
            { status: 500 }
        );
    }
}
