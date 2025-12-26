'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

import ProfileGuard from '@/components/ProfileGuard';

function ClarityContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get('q') || '';

    const [question, setQuestion] = useState(initialQuery);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [credits, setCredits] = useState<number | null>(null);

    const [result, setResult] = useState<null | {
        questionContext: string;
        phaseOverview: string;
        decisionTreeSteps: string[];
        finalVerdict: string;
        patternInsights: string[];
        actionGuidance: string[];
        reflectiveQuestions: string[];
        ethicalClosing: string;
    }>(null);

    const triggerAsk = useCallback(async (q: string) => {
        setIsAnalyzing(true);
        setResult(null);
        setError(null);

        try {
            const response = await fetch('/api/clarity/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: q }),
            });

            const data = await response.json();

            if (response.status === 401) {
                router.push(`/login?callbackUrl=/clarity?q=${encodeURIComponent(q)}`);
                return;
            }

            if (response.status === 402) {
                setError("You've run out of credits. Please purchase more to seek clarity.");
                return;
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get insights');
            }

            setResult(data.response);
            setCredits(data.remainingCredits);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
            setError(errorMessage);
        } finally {
            setIsAnalyzing(false);
        }
    }, [router]);

    // Auto-trigger if question comes from homepage
    useEffect(() => {
        if (initialQuery && initialQuery.length >= 10) {
            triggerAsk(initialQuery);
        }

        const fetchCredits = async () => {
            try {
                const res = await fetch('/api/credits/check');
                if (res.ok) {
                    const data = await res.json();
                    setCredits(data.totalCredits);
                }
            } catch (err) {
                console.error('Failed to fetch credits:', err);
            }
        };
        fetchCredits();
    }, [initialQuery, triggerAsk]);

    const handleAsk = (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || question.length < 10) return;
        triggerAsk(question);
    };

    return (
        <div className={`container ${styles.pageContainer}`}>
            <h1 className={styles.title}>Ask for Clarity</h1>
            <p className={styles.subtitle}>
                Ask one focused question to understand a pattern in your chart.
            </p>

            {credits !== null && (
                <p className={styles.creditsInfo}>Remaining Credits: {credits}</p>
            )}

            {error && (
                <div className={styles.errorBox}>
                    <p>{error}</p>
                    {error.includes('credits') && (
                        <Link href="/pricing" className={styles.actionLink}>Buy Credits</Link>
                    )}
                    {error.includes('chart') && (
                        <Link href="/chart" className={styles.actionLink}>Create Chart</Link>
                    )}
                </div>
            )}

            {!result && (
                <>
                    <div className={styles.rulesBox}>
                        <h3>Before You Ask</h3>
                        <ul>
                            <li>One question at a time</li>
                            <li>No predictions or guarantees</li>
                            <li>Astrology supports reflection, not decisions</li>
                        </ul>
                    </div>

                    <form onSubmit={handleAsk} className={styles.inputContainer}>
                        <textarea
                            className={styles.questionInput}
                            placeholder="e.g., 'How should I approach communication in my relationship right now?'"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            disabled={isAnalyzing}
                        />
                        <button
                            type="submit"
                            className={styles.askBtn}
                            disabled={isAnalyzing || !question.trim() || question.length < 10}
                        >
                            {isAnalyzing ? 'Reflecting on patterns...' : 'Seek Clarity'}
                        </button>
                    </form>
                </>
            )}

            {isAnalyzing && (
                <div className={styles.loadingState}>
                    <div className={styles.orb}></div>
                    <p>Connecting to your chart patterns...</p>
                </div>
            )}

            {result && (
                <div className={styles.resultContainer}>
                    {/* Section A: Question Context */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Your Question</h2>
                        <p className={styles.questionContext}>&quot;{result.questionContext}&quot;</p>
                    </div>

                    {/* Section BA: Decision Tree Verdict */}
                    <div className={`${styles.section} ${styles.verdictSection}`}>
                        <div className={styles.verdictHeader}>
                            <h2 className={styles.sectionTitle}>Action Verdict</h2>
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
                        <h2 className={styles.sectionTitle}>Current Timing Overview</h2>
                        <p>{result.phaseOverview}</p>
                    </div>

                    {/* Section C: Pattern Insights */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>What This Phase Highlights</h2>
                        <ul className={styles.insightList}>
                            {result.patternInsights.map((insight: string, i: number) => (
                                <li key={i}>{insight}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Section D: Action Guidance (Most Valuable) */}
                    <div className={`${styles.section} ${styles.guidanceSection}`}>
                        <h2 className={styles.sectionTitle}>How You Can Respond Consciously</h2>
                        <ul className={styles.actionList}>
                            {result.actionGuidance.map((action: string, i: number) => (
                                <li key={i}>{action}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Section E: Reflective Questions */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Questions Worth Reflecting On</h2>
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

                    <button
                        onClick={() => { setResult(null); setQuestion(''); }}
                        className={styles.resetBtn}
                    >
                        Ask Another Question
                    </button>
                </div>
            )}
        </div>
    );
}

export default function ClarityPage() {
    return (
        <ProfileGuard>
            <Suspense fallback={<div className="container">Loading...</div>}>
                <ClarityContent />
            </Suspense>
        </ProfileGuard>
    );
}
