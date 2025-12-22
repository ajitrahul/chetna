import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Find oldest pack with available credits
        const creditPack = await prisma.creditPack.findFirst({
            where: {
                userId: session.user.id,
                questionsUsed: {
                    lt: prisma.creditPack.fields.questionsTotal,
                },
            },
            orderBy: {
                purchasedAt: 'asc',
            },
        });

        if (!creditPack) {
            return NextResponse.json(
                { error: 'No credits available' },
                { status: 402 } // Payment Required
            );
        }

        // Deduct one credit
        await prisma.creditPack.update({
            where: { id: creditPack.id },
            data: {
                questionsUsed: {
                    increment: 1,
                },
            },
        });

        const remaining = creditPack.questionsTotal - creditPack.questionsUsed - 1;

        return NextResponse.json({
            success: true,
            remaining,
            packId: creditPack.id,
        });
    } catch (error) {
        console.error('Credit deduction error:', error);
        return NextResponse.json(
            { error: 'Failed to use credit' },
            { status: 500 }
        );
    }
}
