'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error('Global error:', error);
    }, [error]);

    return (
        <html lang="en">
            <body
                style={{
                    margin: 0,
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: 16,
                    padding: 24,
                    background: '#0b0f2f',
                    color: '#dfe0ff',
                    fontFamily: 'system-ui, sans-serif',
                }}
            >
                <span style={{ fontSize: '3rem', color: '#d4af37' }}>☄</span>
                <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Something went wrong</h2>
                <p style={{ color: '#9aa0c7', maxWidth: 460, lineHeight: 1.6 }}>
                    A critical error occurred. Please try again.
                </p>
                <button
                    onClick={reset}
                    style={{
                        padding: '12px 28px',
                        borderRadius: 50,
                        border: 'none',
                        background: '#d4af37',
                        color: '#101010',
                        fontWeight: 700,
                        cursor: 'pointer',
                    }}
                >
                    Try Again
                </button>
            </body>
        </html>
    );
}
