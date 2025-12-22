'use client';

import { useState, useEffect } from 'react';
import styles from './EnergyWidget.module.css';

// Mock data for the "Current Energy" - normally this would come from an API
const CURRENT_TRANSITS = {
    header: "Cosmic Weather",
    transit: "Moon in Scorpio",
    theme: "Emotional Depth",
    prompt: "What feelings are you keeping below the surface today?"
};

export default function EnergyWidget() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null; // Hydration fix

    return (
        <div className={styles.widget}>
            <div className={styles.badge}>Today's Energy</div>
            <div className={styles.content}>
                <div className={styles.iconWrapper}>
                    {/* Simple Moon Icon (CSS) */}
                    <div className={styles.moonIcon}></div>
                </div>
                <div className={styles.textGroup}>
                    <h3 className={styles.transit}>{CURRENT_TRANSITS.transit}</h3>
                    <p className={styles.theme}>{CURRENT_TRANSITS.theme}</p>
                </div>
            </div>
            <div className={styles.divider}></div>
            <p className={styles.prompt}>“{CURRENT_TRANSITS.prompt}”</p>
        </div>
    );
}
