import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const welcomeBonusSetting = await prisma.serviceCost.findUnique({
            where: { key: 'WELCOME_BONUS' },
            select: { credits: true }
        });

        const bonusAmount = welcomeBonusSetting?.credits ?? 10;

        return NextResponse.json(
            { bonusAmount },
            {
                headers: {
                    'Cache-Control': 'no-store, max-age=0'
                }
            }
        );
    } catch (error) {
        console.error('Public welcome bonus fetch error:', error);

        return NextResponse.json(
            { bonusAmount: 10 },
            {
                headers: {
                    'Cache-Control': 'no-store, max-age=0'
                }
            }
        );
    }
}
