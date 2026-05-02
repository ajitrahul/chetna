import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

async function getWelcomeBonusStatus(userId: string) {
    const [user, welcomeBonusPack, welcomeBonusTx] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: { welcomeBonusNotifiedAt: true }
        }),
        prisma.creditPack.findFirst({
            where: {
                userId,
                packType: 'WELCOME_BONUS'
            },
            select: {
                questionsTotal: true
            }
        }),
        prisma.creditTransaction.findFirst({
            where: {
                userId,
                amount: {
                    gt: 0
                },
                description: {
                    contains: 'Welcome Bonus'
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                amount: true
            }
        })
    ]);

    const credits = welcomeBonusPack?.questionsTotal ?? welcomeBonusTx?.amount ?? 0;
    const show = credits > 0 && !user?.welcomeBonusNotifiedAt;

    return { show, credits };
}

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await getWelcomeBonusStatus(session.user.id);

        if (!result.show) {
            return NextResponse.json({ show: false });
        }

        return NextResponse.json({
            show: true,
            message: `Welcome bonus credited: ${result.credits} free credits have been added to your account.`
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2022') {
            return NextResponse.json(
                { error: 'Welcome bonus notice schema is not synced yet. Please run Prisma schema sync.' },
                { status: 503 }
            );
        }

        console.error('Welcome bonus notice error:', error);
        return NextResponse.json({ error: 'Failed to process welcome bonus notice' }, { status: 500 });
    }
}

export async function POST() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const status = await getWelcomeBonusStatus(session.user.id);
        if (!status.show) {
            return NextResponse.json({ acknowledged: false });
        }

        const update = await prisma.user.updateMany({
            where: {
                id: session.user.id,
                welcomeBonusNotifiedAt: null
            },
            data: {
                welcomeBonusNotifiedAt: new Date()
            }
        });

        return NextResponse.json({ acknowledged: update.count > 0 });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2022') {
            return NextResponse.json(
                { error: 'Welcome bonus notice schema is not synced yet. Please run Prisma schema sync.' },
                { status: 503 }
            );
        }

        console.error('Welcome bonus notice acknowledge error:', error);
        return NextResponse.json({ error: 'Failed to acknowledge welcome bonus notice' }, { status: 500 });
    }
}
