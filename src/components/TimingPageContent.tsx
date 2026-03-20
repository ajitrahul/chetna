'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from '../app/timing/page.module.css';
import { Clock, Calendar, Info, Sparkles, User, Zap, Loader2 } from 'lucide-react';

import DashaDisplay from '@/components/DashaDisplay';

interface UserProfile {
    id: string;
    name: string;
    dateOfBirth: string | Date;
    chartData?: any;
}

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

export default function TimingPageContent() {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [profilesLoading, setProfilesLoading] = useState(true);
    const [fetchingAi, setFetchingAi] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dashas, setDashas] = useState<DashaPeriod[]>([]);
    const [currentDasha, setCurrentDasha] = useState<DashaPeriod | null>(null);
    const [activeProfiles, setActiveProfiles] = useState<UserProfile[]>([]);
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
    const [aiInsight, setAiInsight] = useState<any>(null);
    const [transits, setTransits] = useState<any>(null);
    const [transitsLoading, setTransitsLoading] = useState(false);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchProfiles();
        } else if (status === 'unauthenticated') {
            setLoading(false);
            setProfilesLoading(false);
        }
    }, [status]);

    const fetchProfiles = async () => {
        try {
            setProfilesLoading(true);
            const profRes = await fetch('/api/profiles/active');
            const activeData = await profRes.json();
            const profiles = activeData.profiles || [];
            setActiveProfiles(profiles);

            if (profiles.length > 0) {
                const urlId = searchParams.get('profileId');
                const initialId = urlId && profiles.some((p: any) => p.id === urlId)
                    ? urlId
                    : profiles[0].id;

                setSelectedProfileId(initialId);
                fetchDashas(initialId);
                fetchTransits(initialId);
            } else {
                setLoading(false);
                setProfilesLoading(false);
            }
        } catch (err) {
            console.error('Failed to fetch profiles:', err);
            setError("Could not load your profiles.");
            setLoading(false);
            setProfilesLoading(false);
        }
    };

    const fetchDashas = async (profileId: string) => {
        try {
            setLoading(true);
            setError(null);
            setAiInsight(null); // Reset AI insight when profile changes
            const dashaRes = await fetch(`/api/astrology/dashas?profileId=${profileId}`);
            const data = await dashaRes.json();

            if (dashaRes.ok && data?.dashas) {
                setDashas(data.dashas);
                const current = data.dashas.find((d: DashaPeriod) => d.isCurrent);
                setCurrentDasha(current);
            } else {
                throw new Error(data.error || "Failed to fetch dasha data.");
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load timing data.";
            setError(errorMessage);
        } finally {
            setLoading(false);
            setProfilesLoading(false);
        }
    };

    const fetchTransits = async (profileId: string) => {
        try {
            setTransitsLoading(true);
            setTransits(null);
            const res = await fetch(`/api/astrology/transits?profileId=${profileId}`);
            if (res.ok) {
                const data = await res.json();
                setTransits(data.transits);
            }
        } catch (e) {
            console.error('Failed to load transits', e);
        } finally {
            setTransitsLoading(false);
        }
    };

    const fetchAiInsight = async () => {
        if (!selectedProfileId || !currentDasha) return;
        setFetchingAi(true);
        try {
            const res = await fetch('/api/ai/timing-insight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profileId: selectedProfileId,
                    currentDasha: {
                        lord: currentDasha.lord,
                        start: currentDasha.start,
                        end: currentDasha.end
                    }
                })
            });
            const data = await res.json();
            if (res.ok) {
                setAiInsight(data.insight);
            } else {
                alert(data.error || 'Failed to generate cosmic insight');
            }
        } catch (err) {
            console.error('Failed to fetch AI insight:', err);
        } finally {
            setFetchingAi(false);
        }
    };

    const handleProfileChange = (id: string) => {
        setSelectedProfileId(id);
        fetchDashas(id);
        fetchTransits(id);
        router.push(`/timing?profileId=${id}`, { scroll: false });
    };

    if (profilesLoading || (loading && dashas.length === 0)) return (
        <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Scanning cosmic cycles...</p>
        </div>
    );

    if (!session) return (
        <div className={styles.container}>
            <div className={styles.guestState}>
                <Clock size={48} className={styles.guestIcon} />
                <h2>Login to View Your Timeline</h2>
                <p>Track your planetary periods and understand the &apos;weather&apos; of your life.</p>
                <button onClick={() => window.location.href = '/login?callbackUrl=/timing'} className={styles.loginBtn}>Login Now</button>
            </div>
        </div>
    );

    if (error && activeProfiles.length === 0) return (
        <div className={styles.container}>
            <div className={styles.errorState}>
                <p>{error}</p>
                <button onClick={() => window.location.href = '/chart'} className={styles.primaryBtn}>Create Chart</button>
            </div>
        </div>
    );

    const interpretation = currentDasha ? LORD_DESCRIPTIONS[currentDasha.lord] : null;
    const selectedProfile = activeProfiles.find(p => p.id === selectedProfileId);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <span className="cosmic-label mb-2 inline-block">Gochar & Dasha · Celestial Weather</span>
                <h1 className="mystic-text">Timing & Seasons</h1>
                <div className="sacred-divider"></div>
                <p className={styles.subtitle}>
                    Planetary periods are foundational cycles that influence your capacity to act and perceive.
                </p>
            </header>

            {/* Profile Selector Tabs */}
            {activeProfiles.length > 1 && (
                <div className={styles.profileTabs}>
                    {activeProfiles.map(p => (
                        <button
                            key={p.id}
                            className={`${styles.profileTab} ${selectedProfileId === p.id ? styles.activeTab : ''}`}
                            onClick={() => handleProfileChange(p.id)}
                        >
                            <User size={14} />
                            {p.name}
                        </button>
                    ))}
                </div>
            )}

            {selectedProfile && (
                <div className={styles.selectedInfo}>
                    Viewing timeline for <strong>{selectedProfile.name}</strong>
                </div>
            )}

            {currentDasha && (
                <div className={`${styles.currentPeriod} sacred-card`}>
                    <div className={styles.periodLabel}>Current Major Phase (Mahadasha)</div>
                    <h2 className="mystic-text text-3xl my-2">{currentDasha.lord} Period</h2>
                    <div className={styles.periodDates}>
                        {new Date(currentDasha.start).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} —
                        {new Date(currentDasha.end).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </div>

                    {!aiInsight && (
                        <button
                            className="primary-btn-cosmic mt-4"
                            onClick={fetchAiInsight}
                            disabled={fetchingAi}
                        >
                            {fetchingAi ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Zap size={18} />
                            )}
                            {fetchingAi ? 'Scanning Personal Chart...' : 'Reveal Personalized AI Insight'}
                        </button>
                    )}
                </div>
            )}

            {/* AI Insight Section */}
            {aiInsight && (
                <div className={styles.aiInsightSection}>
                    <div className={`${styles.aiCard} sacred-card !border-[var(--accent-gold)]`}>
                        <div className={styles.aiCardHeader}>
                            <Sparkles size={20} className="text-[var(--accent-gold)]" />
                            <h3 className="mystic-text !text-xl">Cosmic Flavor Analysis</h3>
                        </div>
                        <p className={styles.aiContent}>{aiInsight.phaseFlavor}</p>
                    </div>

                    <div className={styles.aiGridSmall}>
                        <div className={styles.aiCardMini}>
                            <div className={styles.aiCardHeaderMini}>
                                <Zap size={16} />
                                <h4>Opportunity Tailwind</h4>
                            </div>
                            <p>{aiInsight.opportunityArea}</p>
                        </div>
                        <div className={styles.aiCardMini}>
                            <div className={styles.aiCardHeaderMini}>
                                <Clock size={16} />
                                <h4>Conscious Practice</h4>
                            </div>
                            <p>{aiInsight.awarenessPractice}</p>
                        </div>
                    </div>
                </div>
            )}

            {!aiInsight && (
                <div className={styles.grid}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <Sparkles size={18} />
                            <h3>What This Phase Supports</h3>
                        </div>
                        <p>{interpretation?.supports || "Observing cosmic patterns..."}</p>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <Info size={18} />
                            <h3>What It Resists</h3>
                        </div>
                        <p>{interpretation?.resists || "Analyzing celestial friction..."}</p>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <Calendar size={18} />
                            <h3>Lifecycle Themes</h3>
                        </div>
                        <p>{interpretation?.themes || "Extracting emotional resonance..."}</p>
                    </div>
                </div>
            )}

            {/* Daily Transits Section (Gochar) */}
            <section className={styles.timelineSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Current Cosmic Weather (Gochar)</h2>
                    <p className="text-sm text-[var(--text-muted)] mt-1 tracking-wide">
                        Temporary planetary movements currently interacting with your natal chart.
                    </p>
                </div>
                {transitsLoading ? (
                    <div className="flex justify-center p-8 opacity-50"><div className={styles.spinner}></div></div>
                ) : transits ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {transits.keyTransits.length > 0 ? transits.keyTransits.map((transitText: string, idx: number) => {
                            const [title, rest] = transitText.split(': ');
                            const isSadeSati = title.includes('Sade Sati');
                            const isJupiter = title.includes('Jupiter');
                            return (
                                <div key={idx} className={`${styles.card} border-l-4 ${isSadeSati ? 'border-amber-500' : isJupiter ? 'border-green-500' : 'border-[var(--primary)]'}`}>
                                    <h4 className="font-semibold text-[var(--primary)] text-sm mb-1 uppercase tracking-wider">{title}</h4>
                                    <p className="text-sm text-[var(--foreground)]">{rest || transitText}</p>
                                </div>
                            );
                        }) : (
                            <div className={`${styles.card} col-span-full text-center py-8 opacity-70`}>
                                <p>No major heavy-planet transits are currently active. Enjoy this period of relative cosmic calm.</p>
                            </div>
                        )}

                        {transits.ashtakavargaScores && transits.ashtakavargaScores.length > 0 && (
                            <div className="col-span-full mt-6">
                                <h3 className="font-semibold text-[var(--primary)] mb-4 uppercase tracking-widest text-sm">Ashtakavarga Transit Strengths</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                    {transits.ashtakavargaScores.map((av: any) => (
                                        <div key={av.planet} className={`${styles.card} flex flex-col items-center p-4 text-center`} title={av.meaning}>
                                            <span className="font-bold text-md">{av.planet}</span>
                                            <div className="text-3xl font-light my-2" style={{ color: av.score >= 5 ? 'var(--success, #4ade80)' : av.score <= 3 ? 'var(--error, #f87171)' : 'var(--primary)' }}>
                                                {av.score}<span className="text-sm text-[var(--text-muted)]">/8</span>
                                            </div>
                                            <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: av.score >= 5 ? 'var(--success, #4ade80)' : av.score <= 3 ? 'var(--error, #f87171)' : 'var(--secondary)' }}>
                                                {av.quality}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </section>

            <section className={styles.timelineSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Extended Timeline Analysis</h2>
                </div>
                {loading ? (
                    <div className="flex justify-center p-12 opacity-50">
                        <div className={styles.spinner}></div>
                    </div>
                ) : (
                    <DashaDisplay dashas={dashas} />
                )}
            </section>
        </div>
    );
}
