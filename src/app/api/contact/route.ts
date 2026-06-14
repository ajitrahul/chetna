import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/mail';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
    try {
        const limit = rateLimit(`contact:${getClientIp(req)}`, { limit: 5, windowMs: 60 * 60 * 1000 });
        if (!limit.allowed) {
            return NextResponse.json(
                { error: 'Too many messages. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
            );
        }

        const { name, email, subject, message, company } = await req.json();

        // Honeypot: a real user never fills this. Pretend success so bots don't learn.
        if (company) {
            return NextResponse.json({ success: true });
        }

        if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
            return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
        }

        if (!EMAIL_RE.test(email)) {
            return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
        }

        if (message.length > 5000) {
            return NextResponse.json({ error: 'Message is too long.' }, { status: 400 });
        }

        const result = await sendContactEmail(name.trim(), email.trim(), subject.trim(), message.trim());

        if (!result.success) {
            return NextResponse.json({ error: 'Failed to send message. Please email us directly.' }, { status: 502 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Contact API error:', error);
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
    }
}
