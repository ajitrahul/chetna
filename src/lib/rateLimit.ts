import { NextRequest } from 'next/server';

/**
 * Lightweight in-memory fixed-window rate limiter.
 *
 * NOTE: state lives in the process, so it is per-instance and resets on cold
 * starts. It's defense-in-depth against casual abuse/bursts — for hard limits
 * across a serverless fleet, back this with Upstash/Redis later.
 */

type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

// Opportunistic cleanup so the map can't grow unbounded.
function sweep(now: number) {
    if (store.size < 5000) return;
    for (const [key, bucket] of store) {
        if (bucket.resetAt <= now) store.delete(key);
    }
}

export function getClientIp(req: NextRequest): string {
    const fwd = req.headers.get('x-forwarded-for');
    if (fwd) return fwd.split(',')[0].trim();
    return req.headers.get('x-real-ip') || 'unknown';
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    retryAfterSeconds: number;
}

export function rateLimit(
    key: string,
    { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
    const now = Date.now();
    sweep(now);

    const bucket = store.get(key);
    if (!bucket || bucket.resetAt <= now) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
    }

    if (bucket.count >= limit) {
        return { allowed: false, remaining: 0, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
    }

    bucket.count += 1;
    return { allowed: true, remaining: limit - bucket.count, retryAfterSeconds: 0 };
}
