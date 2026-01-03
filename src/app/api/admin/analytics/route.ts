
import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAccess } from '@/lib/admin';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    if (!await checkAdminAccess()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];

        // Find user IDs for admin emails to exclude them from analytics
        const adminUsers = await prisma.user.findMany({
            where: { email: { in: adminEmails, mode: 'insensitive' } },
            select: { id: true }
        });
        const adminIds = adminUsers.map(u => u.id);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalUsers,
            totalQuestions,
            totalRevenue,
            activeProfiles,
            dailyViews,
            totalViews,
            topCountries
        ] = await Promise.all([
            prisma.user.count(),
            prisma.question.count(),
            prisma.creditPack.aggregate({
                _sum: { amount: true }
            }),
            prisma.profile.count({ where: { isActive: true } }),
            // New Analytics excluding admins
            prisma.analyticsEvent.count({
                where: {
                    type: 'PAGE_VIEW',
                    createdAt: { gte: today },
                    userId: { notIn: adminIds }
                }
            }),
            prisma.analyticsEvent.count({
                where: {
                    type: 'PAGE_VIEW',
                    userId: { notIn: adminIds }
                }
            }),
            prisma.analyticsEvent.groupBy({
                where: { userId: { notIn: adminIds } },
                by: ['country'],
                _count: { country: true },
                orderBy: { _count: { country: 'desc' } },
                take: 5
            })
        ]);

        return NextResponse.json({
            totalUsers,
            totalQuestions,
            totalRevenue: (totalRevenue._sum.amount || 0) / 100,
            activeProfiles,
            dailyViews,
            totalViews,
            topCountries
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
