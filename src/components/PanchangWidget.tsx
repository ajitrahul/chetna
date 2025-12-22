'use client';

import { useState, useEffect } from 'react';
import { Compass, Moon, Sun, Wind, Activity } from 'lucide-react';
import styles from './PanchangWidget.module.css';

interface PanchangData {
    tithi: { name: string; paksha: string; index: number };
    vara: string;
    nakshatra: { name: string; lord: string };
    yoga: string;
    karana: string;
    sunSign: string;
    moonSign: string;
}

export default function PanchangWidget() {
    const [data, setData] = useState<PanchangData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPanchang() {
            try {
                const res = await fetch('/api/astrology/panchang');
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.details || errorData.error || `Server Error (${res.status})`);
                }

                const json = await res.json();
                if (json.error) throw new Error(json.error);

                setData(json);
            } catch (error: any) {
                console.error('Failed to fetch panchang:', error.message);
                // We don't clear the error state here because we want to show nothing (null) 
                // if it fails, per current UI logic, but now we have better console logs.
            } finally {
                setLoading(false);
            }
        }
        fetchPanchang();
    }, []);

    if (loading) return <div className={styles.container + ' ' + styles.shimmer}></div>;
    if (!data || !data.tithi) return null;

    const elements = [
        { label: 'Tithi', value: data.tithi.name, sub: data.tithi.paksha, icon: <Moon size={18} /> },
        { label: 'Nakshatra', value: data.nakshatra.name, sub: `Lord: ${data.nakshatra.lord}`, icon: <SparkleIcon /> },
        { label: 'Vara', value: data.vara, sub: 'Solar Day', icon: <Sun size={18} /> },
        { label: 'Yoga', value: data.yoga, sub: 'Lunar-Solar Union', icon: <Wind size={18} /> },
        { label: 'Karana', value: data.karana, sub: 'Half Tithi', icon: <Activity size={18} /> },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Compass size={20} className={styles.mainIcon} />
                <h3 className={styles.title}>Today's Five Elements (Panchang)</h3>
            </div>

            <div className={styles.grid}>
                {elements.map((el, i) => (
                    <div key={i} className={styles.element}>
                        <div className={styles.iconBox}>{el.icon}</div>
                        <div className={styles.info}>
                            <span className={styles.label}>{el.label}</span>
                            <span className={styles.value}>{el.value}</span>
                            <span className={styles.subText}>{el.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.awareness}>
                <p><strong>Awareness:</strong> The lunar energy of <em>{data.tithi.name}</em> invites you to reflect on your {data.tithi.index < 15 ? 'growth and expansion' : 'release and inner contemplation'} today.</p>
            </div>
        </div>
    );
}

function SparkleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
        </svg>
    );
}
