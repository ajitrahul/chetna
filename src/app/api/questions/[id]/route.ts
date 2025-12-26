import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;

        const question = await prisma.question.findUnique({
            where: {
                id: id,
                userId: session.user.id // Security check
            },
        });

        if (!question) {
            return NextResponse.json(
                { error: 'Question not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(question);
    } catch (error) {
        console.error('Failed to fetch question:', error);
        return NextResponse.json(
            { error: 'Failed to fetch question' },
            { status: 500 }
        );
    }
}
