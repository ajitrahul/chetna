'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styles from './system.module.css';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error('Route error:', error);
    }, [error]);

    return (
        <main className={styles.wrap}>
            <span className={styles.glyph}>☄</span>
            <h2 className={styles.title}>Something disrupted the cosmic flow</h2>
            <p className={styles.text}>
                An unexpected error occurred while reading the stars. You can try again, or head back home.
            </p>
            <div className={styles.actions}>
                <button onClick={reset} className="primary-btn-cosmic">Try Again</button>
                <Link href="/" className={styles.secondaryLink}>Return Home</Link>
            </div>
        </main>
    );
}
