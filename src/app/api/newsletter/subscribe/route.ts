
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
    try {
        const limit = rateLimit(`newsletter:${getClientIp(req)}`, { limit: 5, windowMs: 60 * 60 * 1000 });
        if (!limit.allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
            );
        }

        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Upsert user to ensure they exist and are subscribed
        await prisma.user.upsert({
            where: { email },
            update: { isSubscribed: true },
            create: {
                email,
                isSubscribed: true,
                name: email.split('@')[0] // Fallback name
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Newsletter Subscribe Error:', error);
        return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }
}
