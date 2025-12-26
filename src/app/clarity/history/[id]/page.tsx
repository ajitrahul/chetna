'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, ShieldCheck, Zap, Compass, Info, HelpCircle } from 'lucide-react';
import styles from '../../page.module.css';
import ProfileGuard from '@/components/ProfileGuard';

interface ClarityResult {
    questionContext: string;
    phaseOverview: string;
    decisionTreeSteps: string[];
    finalVerdict: string;
    patternInsights: string[];
    actionGuidance: string[];
    reflectiveQuestions: string[];
    ethicalClosing: string;
}

function HistoryDetailContent({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ClarityResult | null>(null);
    const [questionText, setQuestionText] = useState('');
    const [createdAt, setCreatedAt] = useState('');

    useEffect(() => {
        const fetchHistoryDetail = async () => {
            try {
                const res = await fetch(`/api/questions/${id}`);
                if (!res.ok) {
                    if (res.status === 404) throw new Error('Insight not found');
                    throw new Error('Failed to load insight history');
                }
                const data = await res.json();
                setResult(data.response);
                setQuestionText(data.questionText);
                setCreatedAt(data.createdAt);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHistoryDetail();
    }, [id]);

    if (loading) {
        return (
            <div className={styles.loadingState}>
                <div className={styles.orb}></div>
                <p>Retrieving your cosmic insights...</p>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className={`container ${styles.pageContainer}`}>
                <div className={styles.errorBox}>
                    <p>{error || 'Insight not found'}</p>
                    <Link href="/profile" className={styles.actionLink}>Back to Profile</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`container ${styles.pageContainer}`}>
            <div className={styles.historyHeader}>
                <Link href="/profile" className={styles.backLink}>
                    <ArrowLeft size={16} />
                    Back to History
                </Link>
                <div className={styles.historyMeta}>
                    <p className={styles.historyLabel}>PREVIOUS INSIGHT</p>
                    <p className={styles.historyDate}>
                        {new Date(createdAt).toLocaleDateString()} at {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>

            <div className={styles.resultContainer}>
                {/* Section A: Question Context */}
                <div className={styles.section}>
                    <div className={styles.sectionIconHeader}>
                        <MessageSquare size={20} className={styles.accentIcon} />
                        <h2 className={styles.sectionTitle}>Your Question</h2>
                    </div>
                    <p className={styles.questionContext}>&quot;{questionText}&quot;</p>
                </div>

                {/* Section BA: Decision Tree Verdict */}
                <div className={`${styles.section} ${styles.verdictSection}`}>
                    <div className={styles.verdictHeader}>
                        <div className={styles.sectionIconHeader}>
                            <ShieldCheck size={20} className={styles.accentIcon} />
                            <h2 className={styles.sectionTitle}>Action Verdict</h2>
                        </div>
                        <div className={`${styles.verdictBadge} ${styles[result.finalVerdict.toLowerCase()]}`}>
                            {result.finalVerdict}
                        </div>
                    </div>
                    <p className={styles.verdictSubtitle}>Vimshottari Decision Tree Analysis:</p>
                    <ul className={styles.treeList}>
                        {result.decisionTreeSteps.map((step, i) => (
                            <li key={i} className={styles.treeStep}>{step}</li>
                        ))}
                    </ul>
                </div>

                {/* Section B: Current Phase Overview */}
                <div className={`${styles.section} ${styles.phaseSection}`}>
                    <div className={styles.sectionIconHeader}>
                        <Zap size={20} className={styles.accentIcon} />
                        <h2 className={styles.sectionTitle}>Current Timing Overview</h2>
                    </div>
                    <p>{result.phaseOverview}</p>
                </div>

                {/* Section C: Pattern Insights */}
                <div className={styles.section}>
                    <div className={styles.sectionIconHeader}>
                        <Info size={20} className={styles.accentIcon} />
                        <h2 className={styles.sectionTitle}>What This Phase Highlights</h2>
                    </div>
                    <ul className={styles.insightList}>
                        {result.patternInsights.map((insight: string, i: number) => (
                            <li key={i}>{insight}</li>
                        ))}
                    </ul>
                </div>

                {/* Section D: Action Guidance */}
                <div className={`${styles.section} ${styles.guidanceSection}`}>
                    <div className={styles.sectionIconHeader}>
                        <Compass size={20} className={styles.accentIcon} />
                        <h2 className={styles.sectionTitle}>How You Can Respond Consciously</h2>
                    </div>
                    <ul className={styles.actionList}>
                        {result.actionGuidance.map((action: string, i: number) => (
                            <li key={i}>{action}</li>
                        ))}
                    </ul>
                </div>

                {/* Section E: Reflective Questions */}
                <div className={styles.section}>
                    <div className={styles.sectionIconHeader}>
                        <HelpCircle size={20} className={styles.accentIcon} />
                        <h2 className={styles.sectionTitle}>Questions Worth Reflecting On</h2>
                    </div>
                    <ul className={styles.reflectionList}>
                        {result.reflectiveQuestions.map((q: string, i: number) => (
                            <li key={i}>{q}</li>
                        ))}
                    </ul>
                </div>

                {/* Section F: Ethical Closing */}
                <div className={`${styles.section} ${styles.closingSection}`}>
                    <p className={styles.ethicalClosing}>{result.ethicalClosing}</p>
                </div>

                <div className={styles.historyFooter}>
                    <p>This insight was generated based on your chart at the time of the question.</p>
                </div>
            </div>
        </div>
    );
}

export default function HistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <ProfileGuard>
            <HistoryDetailContent params={params} />
        </ProfileGuard>
    );
}
