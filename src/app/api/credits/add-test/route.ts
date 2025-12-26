import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function POST() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized. User ID not found.' },
                { status: 401 }
            );
        }

        // Add 10 test credits
        await prisma.creditPack.create({
            data: {
                userId: session.user.id,
                packType: 'TEST_CREDITS',
                questionsTotal: 10,
                questionsUsed: 0,
                paymentId: `test_${Date.now()}`,
                amount: 0,
            },
        });

        return NextResponse.json({
            success: true,
            message: '10 test credits added successfully!',
            currentBalanceLink: '/clarity'
        });
    } catch (error) {
        console.error('Test credit error:', error);
        return NextResponse.json(
            { error: 'Failed to add test credits' },
            { status: 500 }
        );
    }
}
