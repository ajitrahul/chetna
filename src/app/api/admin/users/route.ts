
import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAccess } from '@/lib/admin';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    if (!await checkAdminAccess()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = (page - 1) * limit;

        // Filter params
        const subscribedFilter = searchParams.get('subscribed'); // 'true' | 'false'
        const cityFilter = searchParams.get('city')?.toLowerCase();
        const minCreditsFilter = parseInt(searchParams.get('minCredits') || '0');

        // Build where clause for user properties
        const where: any = {};
        if (subscribedFilter === 'true') where.isSubscribed = true;
        if (subscribedFilter === 'false') where.isSubscribed = false;

        // If filtering by city, we need to push it into the profile relation
        if (cityFilter) {
            where.profiles = {
                some: {
                    placeOfBirth: {
                        contains: cityFilter,
                        mode: 'insensitive'
                    }
                }
            };
        }

        const [users, total] = await Promise.all([
            (prisma.user as any).findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                    isSubscribed: true,
                    creditPacks: {
                        select: {
                            questionsTotal: true,
                            questionsUsed: true
                        }
                    }
                }
            }),
            (prisma.user as any).count({ where })
        ]);

        // Fetch "Real Location" (first analytics event) for each user
        const userIds = users.map((u: any) => u.id);
        const firstEvents = await (prisma as any).analyticsEvent.findMany({
            where: {
                userId: { in: userIds },
                city: { not: 'Unknown' }
            },
            orderBy: { createdAt: 'asc' },
            distinct: ['userId']
        });

        const locationMap = new Map(firstEvents.map((e: any) => [e.userId, `${e.city}, ${e.country}`]));

        // Transform data and calculate available credits
        let usersWithCredits = users.map((user: any) => {
            const availableCredits = (user.creditPacks || []).reduce((acc: number, pack: any) => {
                return acc + Math.max(0, pack.questionsTotal - pack.questionsUsed);
            }, 0);

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                isSubscribed: user.isSubscribed,
                credits: availableCredits,
                city: locationMap.get(user.id) || 'N/A'
            };
        });

        // Backend filtering for min credits (since it's a calculated field)
        if (minCreditsFilter > 0) {
            usersWithCredits = usersWithCredits.filter((u: any) => u.credits >= minCreditsFilter);
        }

        return NextResponse.json({
            users: usersWithCredits,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Admin Users API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
