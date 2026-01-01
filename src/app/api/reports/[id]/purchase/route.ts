import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

const REPORT_COST = 99;

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // 1. Check if user has enough credits
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

        const totalAvailable = creditPacks.reduce(
            (sum, pack) => sum + (pack.questionsTotal - pack.questionsUsed),
            0
        );

        if (totalAvailable < REPORT_COST) {
            return NextResponse.json({
                error: 'Insufficient credits',
                message: `You need ${REPORT_COST} credits to unlock this report.`
            }, { status: 402 });
        }

        // 2. Deduct credits
        let remainingToDeduct = REPORT_COST;
        for (const pack of creditPacks) {
            const packAvailable = pack.questionsTotal - pack.questionsUsed;
            const toDeduct = Math.min(packAvailable, remainingToDeduct);

            await prisma.creditPack.update({
                where: { id: pack.id },
                data: {
                    questionsUsed: {
                        increment: toDeduct,
                    },
                },
            });

            remainingToDeduct -= toDeduct;
            if (remainingToDeduct <= 0) break;
        }

        // 3. Update report status
        await prisma.report.update({
            where: { profileId: id },
            data: {
                status: 'purchased'
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Report unlocked successfully!'
        });

    } catch (error) {
        console.error('Purchase error:', error);
        return NextResponse.json({ error: 'Failed to complete purchase' }, { status: 500 });
    }
}
