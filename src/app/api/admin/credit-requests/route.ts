import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAccess } from '@/lib/admin';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const ALLOWED_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;

export async function GET(req: NextRequest) {
    if (!await checkAdminAccess()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const rawStatus = searchParams.get('status');
        const status = rawStatus ? rawStatus.toUpperCase() : null;

        const where =
            status && ALLOWED_STATUSES.includes(status as (typeof ALLOWED_STATUSES)[number])
                ? { status }
                : undefined;

        const requests = await prisma.creditRequest.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ requests });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
            return NextResponse.json(
                {
                    requests: [],
                    warning: 'Credit requests table is not available yet. Please run Prisma schema sync.'
                },
                { status: 200 }
            );
        }

        console.error('Admin credit request fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch credit requests' }, { status: 500 });
    }
}
