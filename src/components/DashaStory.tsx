'use client';

import React from 'react';
import { BookOpen, Layers, Zap, Info, Activity, Flame } from 'lucide-react';
import styles from './DashaStory.module.css';

interface DashaPeriod {
    lord: string;
    start: string;
    end: string;
    isCurrent: boolean;
    antardashas?: Array<{
        lord: string;
        start: string;
        end: string;
        isCurrent: boolean;
        pratyantarDashas?: Array<{
            lord: string;
            start: string;
            end: string;
            isCurrent: boolean;
            sookshmaDashas?: Array<{
                lord: string;
                start: string;
                end: string;
                isCurrent: boolean;
                pranaDashas?: Array<{
                    lord: string;
                    start: string;
                    end: string;
                    isCurrent: boolean;
                }>;
            }>;
        }>;
    }>;
}

interface DashaStoryProps {
    dashas: DashaPeriod[];
}

const DASHA_DURATIONS = [
    { planet: 'Sun', duration: '6 Years' },
    { planet: 'Moon', duration: '10 Years' },
    { planet: 'Mars', duration: '7 Years' },
    { planet: 'Rahu', duration: '18 Years' },
    { planet: 'Jupiter', duration: '16 Years' },
    { planet: 'Saturn', duration: '19 Years' },
    { planet: 'Mercury', duration: '17 Years' },
    { planet: 'Ketu', duration: '7 Years' },
    { planet: 'Venus', duration: '20 Years' },
];

export default function DashaStory({ dashas }: DashaStoryProps) {
    const activeMaha = dashas.find(d => d.isCurrent);
    const activeAntar = activeMaha?.antardashas?.find(ad => ad.isCurrent);
    const activePratyantar = activeAntar?.pratyantarDashas?.find(pd => pd.isCurrent);
    const activeSookshma = activePratyantar?.sookshmaDashas?.find(sd => sd.isCurrent);
    const activePrana = activeSookshma?.pranaDashas?.find(pd => pd.isCurrent);

    if (!activeMaha) return null;

    const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const formatDateTime = (iso: string) => new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

    return (
        <div className={styles.container}>
            <div className={styles.storyHeader}>
                <h3 className={styles.title}>Your Vimsottari Story</h3>
                <p className={styles.subtitle}>Understanding the 5 layers of your soul&apos;s journey</p>
            </div>

            <div className={styles.storyGrid}>
                {/* Level 1: Mahadasha */}
                <div className={`${styles.storyCard} ${styles.maha}`}>
                    <div className={styles.levelBadge}>Level 1: Core Chapter</div>
                    <div className={styles.cardMain}>
                        <BookOpen className={styles.icon} />
                        <div className={styles.cardContent}>
                            <h4>{activeMaha.lord} Mahadasha</h4>
                            <p className={styles.question}>What phase of life am I in?</p>
                            <p className={styles.dates}>{formatDate(activeMaha.start)} — {formatDate(activeMaha.end)}</p>
                        </div>
                    </div>
                </div>

                {/* Level 2: Antardasha */}
                {activeAntar && (
                    <div className={`${styles.storyCard} ${styles.antar}`}>
                        <div className={styles.levelBadge}>Level 2: Sub-Story</div>
                        <div className={styles.cardMain}>
                            <Layers className={styles.icon} />
                            <div className={styles.cardContent}>
                                <h4>{activeAntar.lord} Antardasha</h4>
                                <p className={styles.question}>Which Area is highlighted?</p>
                                <p className={styles.dates}>{formatDate(activeAntar.start)} — {formatDate(activeAntar.end)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Level 3: Pratyantar */}
                {activePratyantar && (
                    <div className={`${styles.storyCard} ${styles.pratya}`}>
                        <div className={styles.levelBadge}>Level 3: Event Activation</div>
                        <div className={styles.cardMain}>
                            <Zap className={styles.icon} />
                            <div className={styles.cardContent}>
                                <h4>{activePratyantar.lord} Pratyantar</h4>
                                <p className={styles.question}>What kind of events occur?</p>
                                <p className={styles.dates}>{formatDate(activePratyantar.start)} — {formatDate(activePratyantar.end)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Level 4: Sookshma */}
                {activeSookshma && (
                    <div className={`${styles.storyCard} ${styles.sookshma}`}>
                        <div className={styles.levelBadge}>Level 4: Emotional Trigger</div>
                        <div className={styles.cardMain}>
                            <Activity className={styles.icon} />
                            <div className={styles.cardContent}>
                                <h4>{activeSookshma.lord} Sookshma</h4>
                                <p className={styles.question}>How do I react?</p>
                                <p className={styles.dates}>{formatDate(activeSookshma.start)} — {formatDate(activeSookshma.end)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Level 5: Prana */}
                {activePrana && (
                    <div className={`${styles.storyCard} ${styles.pranaLevel}`}>
                        <div className={styles.levelBadge}>Level 5: Energy Pulse</div>
                        <div className={styles.cardMain}>
                            <Flame className={styles.icon} />
                            <div className={styles.cardContent}>
                                <h4>{activePrana.lord} Prana</h4>
                                <p className={styles.question}>What happens now?</p>
                                <p className={styles.dates}>{formatDateTime(activePrana.start)} — {formatDateTime(activePrana.end)}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Dasha Duration Reference */}
            <div className={styles.referenceSection}>
                <div className={styles.refHeader}>
                    <Info size={16} />
                    <span>Dasha Durations Reference</span>
                </div>
                <div className={styles.tableGrid}>
                    {DASHA_DURATIONS.map((d, i) => (
                        <div key={i} className={styles.tableItem}>
                            <span className={styles.planet}>{d.planet}</span>
                            <span className={styles.duration}>{d.duration}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
