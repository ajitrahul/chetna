
'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const hasTracked = useRef<string | null>(null);

    useEffect(() => {
        const url = pathname + searchParams.toString();

        // Prevent duplicate tracking for same URL in strict mode/re-renders
        if (hasTracked.current === url) return;
        hasTracked.current = url;

        trackPageView(pathname);
    }, [pathname, searchParams, session]); // Re-track if user logs in on same page? Maybe overcounting, but safer for attribution.

    const trackPageView = async (path: string) => {
        try {
            await fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'PAGE_VIEW',
                    path,
                    // userId and location handled by server
                })
            });
        } catch (e) {
            // silent fail
        }
    };

    return null; // Renderless component
}
