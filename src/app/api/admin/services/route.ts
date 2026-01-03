
import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAccess } from '@/lib/admin';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    if (!await checkAdminAccess()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const services = await prisma.serviceCost.findMany({
            orderBy: { key: 'asc' }
        });
        return NextResponse.json(services);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    if (!await checkAdminAccess()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { key, credits } = await req.json();

        const service = await prisma.serviceCost.update({
            where: { key },
            data: { credits: parseInt(credits) }
        });

        return NextResponse.json(service);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update service cost' }, { status: 500 });
    }
}
