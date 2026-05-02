import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function POST() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const welcomeBonusPack = await tx.creditPack.findFirst({
                where: {
                    userId: session.user.id,
                    packType: 'WELCOME_BONUS'
                },
                select: {
                    questionsTotal: true
                }
            });

            if (!welcomeBonusPack) {
                return { show: false };
            }

            const notifyUpdate = await tx.user.updateMany({
                where: {
                    id: session.user.id,
                    welcomeBonusNotifiedAt: null
                },
                data: {
                    welcomeBonusNotifiedAt: new Date()
                }
            });

            if (notifyUpdate.count === 0) {
                return { show: false };
            }

            return {
                show: true,
                credits: welcomeBonusPack.questionsTotal
            };
        });

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
