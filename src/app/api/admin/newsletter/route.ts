
import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAccess } from '@/lib/admin';
import { sendNewsletter } from '@/lib/mail';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    if (!await checkAdminAccess()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { subject, content } = await req.json();

        // 1. Get all subscribed users
        const subscribers = await prisma.user.findMany({
            where: { isSubscribed: true },
            select: { email: true }
        });

        const emails = subscribers.map(u => u.email).filter((e): e is string => !!e);

        // 2. Send email
        const result = await sendNewsletter(emails, subject, content);

        if (!result.success) {
            throw result.error;
        }

        // 3. Log event
        await prisma.newsletter.create({
            data: {
                subject,
                content,
                recipientsCount: result.count || 0
            }
        });

        return NextResponse.json({ success: true, count: result.count });

    } catch (error) {
        console.error('Newsletter API Error:', error);
        return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 500 });
    }
}
