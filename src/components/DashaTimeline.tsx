'use client';

import { useState } from 'react';
import styles from './DashaTimeline.module.css';

interface DashaPeriod {
    lord: string;
    start: string;
    end: string;
    isCurrent: boolean;
}

// Plain-language theme per planet so the timeline reads as life seasons, not planet names
const LORD_THEME: Record<string, string> = {
    Jupiter: 'Growth & learning',
    Saturn: 'Discipline & building',
    Mercury: 'Communication & learning',
    Venus: 'Relationships & creativity',
    Sun: 'Identity & leadership',
    Moon: 'Emotion & care',
    Mars: 'Action & effort',
    Rahu: 'Ambition & the unfamiliar',
    Ketu: 'Release & introspection',
};

export default function DashaTimeline({ dashas }: { dashas: DashaPeriod[] }) {
    const currentIndex = dashas.findIndex((d) => d.isCurrent);
    const [selected, setSelected] = useState(currentIndex >= 0 ? currentIndex : 0);

    if (!dashas.length) return null;

    const sel = dashas[selected];
    const year = (d: string) => new Date(d).getFullYear();

    return (
        <section className={styles.wrapper}>
            <div className={styles.header}>
                <h2 className={styles.title}>Your Life Timeline</h2>
                <p className={styles.subtitle}>Each segment is a multi-year season. Your current phase is highlighted — tap any to explore.</p>
            </div>

            <div className={styles.track}>
                {dashas.map((d, i) => (
                    <button
                        key={`${d.lord}-${d.start}`}
                        className={`${styles.segment} ${d.isCurrent ? styles.current : ''} ${i === selected ? styles.active : ''}`}
                        onClick={() => setSelected(i)}
                        title={`${d.lord}: ${year(d.start)}–${year(d.end)}`}
                    >
                        <span className={styles.segLord}>{d.lord}</span>
                        <span className={styles.segYears}>{year(d.start)}</span>
                    </button>
                ))}
            </div>

            {sel && (
                <div className={styles.detail}>
                    <div className={styles.detailHead}>
                        <span className={styles.detailRange}>{year(sel.start)} – {year(sel.end)}</span>
                        {sel.isCurrent && <span className={styles.nowBadge}>You are here</span>}
                    </div>
                    <h3 className={styles.detailTheme}>{LORD_THEME[sel.lord] || 'A distinct life season'}</h3>
                    <p className={styles.detailNote}>
                        This is your <strong>{sel.lord}</strong> Mahadasha — a chapter themed around {(LORD_THEME[sel.lord] || 'its own lessons').toLowerCase()}.
                    </p>
                </div>
            )}
        </section>
    );
}
