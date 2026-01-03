
import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAccess } from '@/lib/admin';
import prisma from '@/lib/prisma';

export async function GET() {
    // This could also be public, but let's keep it admin for management view
    if (!await checkAdminAccess()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const plans = await prisma.pricingPlan.findMany({
        orderBy: { price: 'asc' }
    });
    return NextResponse.json(plans);
}

export async function PUT(req: NextRequest) {
    if (!await checkAdminAccess()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { key, price, name, description, credits } = body;

        const updated = await prisma.pricingPlan.update({
            where: { key },
            data: {
                price: price, // Expecting value in paise
                name,
                description,
                credits
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Update Pricing Error:', error);
        return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
    }
}
