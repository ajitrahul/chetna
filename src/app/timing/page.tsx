'use client';

import { Suspense } from 'react';
import TimingPageContent from '@/components/TimingPageContent';
import styles from './page.module.css';

export default function TimingPage() {
    return (
        <Suspense fallback={
            <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Aligning celestial bodies...</p>
            </div>
        }>
            <TimingPageContent />
        </Suspense>
    );
}
