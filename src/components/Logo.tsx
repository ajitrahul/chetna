'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Logo({ width = 120, height = 40 }: { width?: number, height?: number }) {
    // Simple theme detection for logo switching
    // In a real app we might use a ThemeProvider context, but this works for system preference
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const checkTheme = () => {
            if (typeof window !== 'undefined' && window.matchMedia) {
                setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
            }
        };

        checkTheme();

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
        mediaQuery.addEventListener('change', listener);

        return () => mediaQuery.removeEventListener('change', listener);
    }, []);

    const src = isDark ? '/chetna_logo_dark.png' : '/chetna_logo_light.png';

    return (
        <div style={{ position: 'relative', width, height, overflow: 'hidden' }}>
            <Image
                src={src}
                alt="Chetna Logo"
                fill
                style={{ objectFit: 'contain', objectPosition: 'left' }}
                priority
            />
        </div>
    );
}
