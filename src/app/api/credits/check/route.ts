import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get all active credit packs with remaining questions
        const creditPacks = await prisma.creditPack.findMany({
            where: {
                userId: session.user.id,
                questionsUsed: {
                    lt: prisma.creditPack.fields.questionsTotal,
                },
            },
            orderBy: {
                purchasedAt: 'asc', // Use oldest credits first
            },
        });

        const totalCredits = creditPacks.reduce(
            (sum, pack) => sum + (pack.questionsTotal - pack.questionsUsed),
            0
        );

        return NextResponse.json({
            totalCredits,
            packs: creditPacks.map(pack => ({
                id: pack.id,
                type: pack.packType,
                remaining: pack.questionsTotal - pack.questionsUsed,
                purchasedAt: pack.purchasedAt,
            })),
        });
    } catch (error) {
        console.error('Credits check error:', error);
        return NextResponse.json(
            { error: 'Failed to check credits' },
            { status: 500 }
        );
    }
}
