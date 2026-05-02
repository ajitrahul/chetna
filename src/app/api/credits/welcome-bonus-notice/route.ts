import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

async function getWelcomeBonusStatus(userId: string) {
    const [user, welcomeBonusPack] = await Promise.all([
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
        })
    ]);

    const show = Boolean(welcomeBonusPack) && !user?.welcomeBonusNotifiedAt;
    const credits = welcomeBonusPack?.questionsTotal ?? 0;

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
        console.error('Welcome bonus notice acknowledge error:', error);
        return NextResponse.json({ error: 'Failed to acknowledge welcome bonus notice' }, { status: 500 });
    }
}
