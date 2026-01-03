
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        const body = await req.json();
        const { type, path, metadata } = body;

        // Try to determine location from Vercel headers (or generic headers)
        const country = req.headers.get('x-vercel-ip-country') || 'Unknown';
        const city = req.headers.get('x-vercel-ip-city') || 'Unknown';
        // Note: Generic IP lookup logic would be needed for local/non-Vercel, 
        // but for now we rely on platform headers which is standard for this stack.

        await prisma.analyticsEvent.create({
            data: {
                type: type || 'UNKNOWN',
                path: path || 'known',
                userId: session?.user?.id || null, // Capture if logged in, null if visitor
                country,
                city,
                metadata: metadata || {}
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        // Don't crash the tracker
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
