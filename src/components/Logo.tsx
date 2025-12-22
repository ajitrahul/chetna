'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Logo({ width = 120, height = 40 }: { width?: number, height?: number }) {
    // Simple theme detection for logo switching
    // In a real app we might use a ThemeProvider context, but this works for system preference
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const checkTheme = () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme) {
                setIsDark(currentTheme === 'dark');
            } else {
                setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
            }
        };

        checkTheme();

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    checkTheme();
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = (e: MediaQueryListEvent) => {
            if (!document.documentElement.getAttribute('data-theme')) {
                setIsDark(e.matches);
            }
        };
        mediaQuery.addEventListener('change', listener);

        return () => {
            observer.disconnect();
            mediaQuery.removeEventListener('change', listener);
        };
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
