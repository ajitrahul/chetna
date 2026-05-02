'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Send, Sparkles, MessageSquare, History, ArrowLeft } from 'lucide-react';
import styles from '../app/clarity/page.module.css';

import ProfileGuard from '@/components/ProfileGuard';
import { PAYMENTS_ENABLED, PAYMENTS_PAUSED_MESSAGE } from '@/lib/paymentConfig';

export default function ClarityPageContent() {
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
                setError(
                    PAYMENTS_ENABLED
                        ? "You've run out of credits. Please purchase more to seek clarity."
                        : `You've run out of credits. ${PAYMENTS_PAUSED_MESSAGE}`
                );
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
        visible: { 
            opacity: 1, 
            y: 0, 
            filter: 'blur(0px)', 
            transition: { duration: 0.8, ease: "circOut" } 
        }
    };

    return (
        <ProfileGuard>
            <div className={`container ${styles.pageContainer}`}>
                <div className={styles.historyHeader}>
                    <Link href="/dashboard" className={styles.backLink}>
                        <ArrowLeft size={16} /> Dashboard
                    </Link>
                    {credits !== null && (
                        <div className={styles.historyMeta}>
                            <div className={styles.historyLabel}>ENERGY UNITS</div>
                            <div className={styles.historyDate}>{credits} AVAILABLE</div>
                        </div>
                    )}
                </div>

                <motion.h1 
                    className={styles.title}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    Oracle Portal
                </motion.h1>
                <motion.p 
                    className={styles.subtitle}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 1 }}
                >
                    Speak your question. Understand the patterns. Act with awareness.
                </motion.p>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div 
                            className={styles.errorBox}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <p>{error}</p>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'center' }}>
                                {error.includes('credits') && (
                                    PAYMENTS_ENABLED ? (
                                        <Link href="/pricing" className={styles.actionLink}>Buy Credits</Link>
                                    ) : null
                                )}
                                {error.includes('chart') && (
                                    <Link href="/chart" className={styles.actionLink}>Create Chart</Link>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {!result && !isAnalyzing && (
                        <motion.div 
                            className={styles.rulesBox}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <h3>Seekers Principles</h3>
                            <ul>
                                <li>Ask focused questions for maximum resonance</li>
                                <li>Observe patterns behind events, not just outcomes</li>
                                <li>Astrology offers perspective, not prescription</li>
                            </ul>
                        </motion.div>
                    )}

                    {isAnalyzing && (
                        <motion.div 
                            className={styles.loadingState}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className={styles.orb}></div>
                            <p>Reading from your planetary configuration...</p>
                        </motion.div>
                    )}

                    {result && (
                        <motion.div 
                            className={styles.resultContainer}
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {/* Section A: Question Context */}
                            <motion.div className={styles.section} variants={itemVariants}>
                                <div className={styles.sectionIconHeader}>
                                    <MessageSquare size={16} className={styles.accentIcon} />
                                    <h2 className={styles.sectionTitle}>The Query</h2>
                                </div>
                                <p className={styles.questionContext}>&quot;{result.questionContext}&quot;</p>
                            </motion.div>

                            {/* Section Verdict */}
                            <motion.div className={`${styles.section} ${styles.verdictSection}`} variants={itemVariants}>
                                <div className={styles.verdictHeader}>
                                    <div>
                                        <div className={styles.sectionIconHeader}>
                                            <Sparkles size={16} className={styles.accentIcon} />
                                            <h2 className={styles.sectionTitle}>Action Verdict</h2>
                                        </div>
                                    </div>
                                    <div className={`${styles.verdictBadge} ${styles[result.finalVerdict.toLowerCase()]}`}>
                                        {result.finalVerdict}
                                    </div>
                                </div>
                                <p className={styles.verdictSubtitle}>Celestial Decision Matrix Analysis:</p>
                                <ul className={styles.treeList}>
                                    {result.decisionTreeSteps.map((step, i) => (
                                        <li key={i} className={styles.treeStep}>{step}</li>
                                    ))}
                                </ul>
                            </motion.div>

                            {/* Section B: Current Phase Overview */}
                            <motion.div className={`${styles.section} ${styles.phaseSection}`} variants={itemVariants}>
                                <h2 className={styles.sectionTitle}>Timing of the Soul</h2>
                                <p>{result.phaseOverview}</p>
                            </motion.div>

                            {/* Section C: Pattern Insights */}
                            <motion.div className={styles.section} variants={itemVariants}>
                                <h2 className={styles.sectionTitle}>Forces at Play</h2>
                                <ul className={styles.insightList}>
                                    {result.patternInsights.map((insight: string, i: number) => (
                                        <li key={i}>{insight}</li>
                                    ))}
                                </ul>
                            </motion.div>

                            {/* Section D: Action Guidance */}
                            <motion.div className={`${styles.section} ${styles.guidanceSection}`} variants={itemVariants}>
                                <h2 className={styles.sectionTitle}>Path to Awareness</h2>
                                <ul className={styles.actionList}>
                                    {result.actionGuidance.map((action: string, i: number) => (
                                        <li key={i}>{action}</li>
                                    ))}
                                </ul>
                            </motion.div>

                            {/* Section E: Reflective Questions */}
                            <motion.div className={styles.section} variants={itemVariants}>
                                <h2 className={styles.sectionTitle}>Contemplations</h2>
                                <ul className={styles.reflectionList}>
                                    {result.reflectiveQuestions.map((q: string, i: number) => (
                                        <li key={i}>{q}</li>
                                    ))}
                                </ul>
                            </motion.div>

                            <motion.button
                                onClick={() => { setResult(null); setQuestion(''); }}
                                className={styles.resetBtn}
                                variants={itemVariants}
                            >
                                Ask Another Question
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.form 
                    onSubmit={handleAsk} 
                    className={styles.inputContainer}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                >
                    <textarea
                        className={styles.questionInput}
                        placeholder="What do you seek to understand?"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        disabled={isAnalyzing}
                    />
                    <button
                        type="submit"
                        className={styles.askBtn}
                        disabled={isAnalyzing || !question.trim() || question.length < 10}
                    >
                        {isAnalyzing ? <div className={styles.loaderSmall}></div> : <Send size={20} />}
                    </button>
                    {isAnalyzing && (
                        <p style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', marginTop: '-8px', textAlign: 'center' }}>
                            Seeking clarity...
                        </p>
                    )}
                </motion.form>
            </div>
        </ProfileGuard>
    );
}
