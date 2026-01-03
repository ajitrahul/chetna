'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';
import { Clock, Calendar, Info, Sparkles } from 'lucide-react';

import DashaDisplay from '@/components/DashaDisplay';

interface PranaDasha {
    lord: string;
    start: string;
    end: string;
    isCurrent: boolean;
}

interface SookshmaDasha {
    lord: string;
    start: string;
    end: string;
    isCurrent: boolean;
    pranaDashas?: PranaDasha[];
}

interface PratyantarDasha {
    lord: string;
    start: string;
    end: string;
    isCurrent: boolean;
    sookshmaDashas?: SookshmaDasha[];
}

interface Antardasha {
    lord: string;
    start: string;
    end: string;
    isCurrent: boolean;
    pratyantarDashas?: PratyantarDasha[];
}

interface DashaPeriod {
    lord: string;
    start: string;
    end: string;
    isCurrent: boolean;
    antardashas?: Antardasha[];
}

const LORD_DESCRIPTIONS: Record<string, { supports: string, resists: string, themes: string }> = {
    'Jupiter': { supports: 'Growth, wisdom, teaching, expansion.', resists: 'Reckless shortcuts, lack of foundations.', themes: 'Optimism, spiritual seeking.' },
    'Saturn': { supports: 'Discipline, structure, long-term legacy.', resists: 'Laziness, superficial expansion.', themes: 'Duty, maturity, reality checks.' },
    'Mercury': { supports: 'Communication, business, learning.', resists: 'Emotional impulsivity, ignoring details.', themes: 'Intelligence, adaptability.' },
    'Venus': { supports: 'Relationships, creativity, comfort.', resists: 'Financial waste, over-indulgence.', themes: 'Beauty, harmony, desire.' },
    'Sun': { supports: 'Leadership, clarity, self-expression.', resists: 'Playing small, ego-driven conflicts.', themes: 'Authority, vitality.' },
    'Moon': { supports: 'Emotional nurturing, caregiving, intuition.', resists: 'Rationalizing feelings, over-sensitivity.', themes: 'Care, home, change.' },
    'Mars': { supports: 'Courage, technical work, competition.', resists: 'Passive-aggression, indecision.', themes: 'Energy, drive, conflict.' },
    'Rahu': { supports: 'Innovation, ambition, breaking norms.', resists: 'Standard paths, repetitive tasks.', themes: 'Desire, obsession, newness.' },
    'Ketu': { supports: 'Introspection, research, moving on.', resists: 'Material attachments, staying in comfort.', themes: 'Detachment, deep focus.' }
};

export default function TimingPage() {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dashas, setDashas] = useState<DashaPeriod[]>([]);
    const [currentDasha, setCurrentDasha] = useState<DashaPeriod | null>(null);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchUserDashas();
        } else if (status === 'unauthenticated') {
            setLoading(false);
        }
    }, [status]);

    const fetchUserDashas = async () => {
        try {
            setLoading(true);
            const profRes = await fetch('/api/profiles/active');
            const activeProfile = await profRes.json();

            if (!activeProfile || activeProfile.error) {
                setError("No active profile found. Please create one in 'Your Chart' first.");
                setLoading(false);
                return;
            }

            const dashaRes = await fetch(`/api/astrology/dashas?profileId=${activeProfile.id}`);
            const data = await dashaRes.json();

            if (data.error) throw new Error(data.error);

            setDashas(data.dashas);
            setCurrentDasha(data.dashas.find((d: DashaPeriod) => d.isCurrent));
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load timing data.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Scanning your timeline...</p>
        </div>
    );

    if (!session) return (
        <div className={styles.container}>
            <div className={styles.guestState}>
                <Clock size={48} className={styles.guestIcon} />
                <h2>Login to View Your Timeline</h2>
                <p>Track your planetary periods and understand the &apos;weather&apos; of your life.</p>
                <button onClick={() => window.location.href = '/login?callbackUrl=/dashboard'} className={styles.loginBtn}>Login Now</button>
            </div>
        </div>
    );

    if (error) return (
        <div className={styles.container}>
            <div className={styles.errorState}>
                <p>{error}</p>
                {error.includes('profiles') && (
                    <button onClick={() => window.location.href = '/chart'} className={styles.primaryBtn}>Create Chart</button>
                )}
            </div>
        </div>
    );

    const interpretation = currentDasha ? LORD_DESCRIPTIONS[currentDasha.lord] : null;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Your Current Timeline</h1>
                <p className={styles.subtitle}>
                    Planetary periods (Dashas) are not destiny. They are &quot;seasons&quot; that influence your capacity to act, feel, and perceive.
                </p>
            </header>

            {currentDasha && (
                <div className={styles.currentPeriod}>
                    <div className={styles.periodLabel}>Current Major Phase (Mahadasha)</div>
                    <h2 className={styles.periodName}>{currentDasha.lord} Period</h2>
                    <div className={styles.periodDates}>
                        {new Date(currentDasha.start).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} —
                        {new Date(currentDasha.end).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </div>
                </div>
            )}

            <div className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <Sparkles size={18} />
                        <h3>What This Phase Supports</h3>
                    </div>
                    <p>{interpretation?.supports || "Loading interpretation..."}</p>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <Info size={18} />
                        <h3>What It Resists</h3>
                    </div>
                    <p>{interpretation?.resists || "Loading interpretation..."}</p>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <Calendar size={18} />
                        <h3>Emotional Themes</h3>
                    </div>
                    <p>{interpretation?.themes || "Loading interpretation..."}</p>
                </div>
            </div>

            <section className={styles.timelineSection}>
                <DashaDisplay dashas={dashas} />
            </section>
        </div>
    );
}
