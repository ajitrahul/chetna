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

        // Fetch expansion cost from database
        const serviceCost = await prisma.serviceCost.findUnique({
            where: { key: 'EXPAND_PROFILE_LIMIT' }
        });
        const EXPANSION_COST = serviceCost?.credits || 50;

        // Check user's current credits
        const creditsRes = await fetch(`${process.env.NEXTURL || 'http://localhost:3000'}/api/credits/check`, {
            headers: {
                cookie: req.headers.get('cookie') || '',
            },
        });
        const { totalCredits } = await creditsRes.json();

        if (totalCredits < EXPANSION_COST) {
            return NextResponse.json(
                { error: 'Insufficient credits', required: EXPANSION_COST },
                { status: 402 }
            );
        }

        // Check hard cap of 10 profiles
        const maxProfilesDefault = parseInt(process.env.MAX_ACTIVE_PROFILES || '5');
        const currentLimitRecord = await (prisma as any).userProfileLimit.findFirst({
            where: { userId: session.user.id },
        });
        const extraSlots = currentLimitRecord?.extraSlots || 0;

        if (maxProfilesDefault + extraSlots >= 10) {
            return NextResponse.json(
                { error: 'Strict limit reached. Maximum of 10 profiles allowed per user.' },
                { status: 400 }
            );
        }

        // Get or create UserProfileLimit record
        let limitRecord;
        if (!currentLimitRecord) {
            limitRecord = await (prisma as any).userProfileLimit.create({
                data: {
                    userId: session.user.id,
                    extraSlots: 1,
                },
            });
        } else {
            limitRecord = await (prisma as any).userProfileLimit.update({
                where: { id: currentLimitRecord.id },
                data: {
                    extraSlots: currentLimitRecord.extraSlots + 1,
                },
            });
        }

        // Deduct credits
        await (prisma as any).creditTransaction.create({
            data: {
                userId: session.user.id,
                amount: -EXPANSION_COST,
                description: `Expanded profile limit (+1 slot)`,
            },
        });

        const newLimit = maxProfilesDefault + limitRecord.extraSlots;

        return NextResponse.json({
            success: true,
            newLimit,
            extraSlots: limitRecord.extraSlots,
            creditsUsed: EXPANSION_COST,
        });
    } catch (error) {
        console.error('Profile limit expansion error:', error);
        return NextResponse.json(
            { error: 'Failed to expand profile limit' },
            { status: 500 }
        );
    }
}
