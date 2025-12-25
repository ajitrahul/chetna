'use client';

import { useState, useEffect } from 'react';
import styles from './EnergyWidget.module.css';

interface TransitInfo {
    transit: string;
    theme: string;
    prompt: string;
    error?: string;
}

export default function EnergyWidget() {
    const [data, setData] = useState<TransitInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/astrology/transit')
            .then(async res => {
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.details || errorData.error || `Transit fetch failed (${res.status})`);
                }
                return res.json();
            })
            .then(transitData => {
                if (transitData.error) throw new Error(transitData.error);
                setData(transitData);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch transits:', err.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className={styles.widget}>
                <div className={styles.shimmer}></div>
            </div>
        );
    }

    if (!data || !data.transit) return null;

    return (
        <div className={styles.widget}>
            <div className={styles.badge}>Today&apos;s Energy</div>
            <div className={styles.content}>
                <div className={styles.iconWrapper}>
                    <div className={styles.moonIcon}></div>
                </div>
                <div className={styles.textGroup}>
                    <h3 className={styles.transit}>{data.transit}</h3>
                    <p className={styles.theme}>{data.theme}</p>
                </div>
            </div>
            <div className={styles.divider}></div>
            <p className={styles.prompt}>“{data.prompt}”</p>
        </div>
    );
}
