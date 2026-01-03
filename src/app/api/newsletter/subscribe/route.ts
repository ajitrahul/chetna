
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
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
