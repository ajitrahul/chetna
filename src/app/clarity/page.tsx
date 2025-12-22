'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function ClarityPage() {
    const [question, setQuestion] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<null | {
        questionContext: string;
        phaseOverview: string;
        patternInsights: string[];
        actionGuidance: string[];
        reflectiveQuestions: string[];
        ethicalClosing: string;
    }>(null);

    const handleAsk = (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) return;

        setIsAnalyzing(true);
        setResult(null);

        // Simulate AI Delay
        setTimeout(() => {
            setIsAnalyzing(false);
            setResult({
                questionContext: question,
                phaseOverview: "This phase emphasizes emotional regulation and clarity in communication. Reactivity may increase confusion; restraint supports stability.",
                patternInsights: [
                    "Tendency to revisit old patterns",
                    "Need for structure over emotion",
                    "Importance of boundaries in relationships",
                    "This is not a phase for impulsive decisions"
                ],
                actionGuidance: [
                    "Choose clarity over emotional intensity",
                    "Speak only when it reduces confusion",
                    "Allow time instead of forcing resolution",
                    "These are actions, not predictions"
                ],
                reflectiveQuestions: [
                    "What am I trying to control here?",
                    "What response supports self-respect?",
                    "Where can patience improve outcomes?"
                ],
                ethicalClosing: "This guidance reflects tendencies, not certainty. Outcomes depend on awareness and action."
            });
        }, 2500);
    };

    return (
        <div className={`container ${styles.pageContainer}`}>
            <h1 className={styles.title}>Ask for Clarity</h1>
            <p className={styles.subtitle}>
                Ask one focused question to understand a pattern in your chart.
            </p>

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
                            disabled={isAnalyzing || !question.trim()}
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
                        <p className={styles.questionContext}>"{result.questionContext}"</p>
                    </div>

                    {/* Section B: Current Phase Overview */}
                    <div className={`${styles.section} ${styles.phaseSection}`}>
                        <h2 className={styles.sectionTitle}>Current Phase Overview</h2>
                        <p>{result.phaseOverview}</p>
                    </div>

                    {/* Section C: Pattern Insights */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>What This Phase Highlights</h2>
                        <ul className={styles.insightList}>
                            {result.patternInsights.map((insight, i) => (
                                <li key={i}>{insight}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Section D: Action Guidance (Most Valuable) */}
                    <div className={`${styles.section} ${styles.guidanceSection}`}>
                        <h2 className={styles.sectionTitle}>How You Can Respond Consciously</h2>
                        <ul className={styles.actionList}>
                            {result.actionGuidance.map((action, i) => (
                                <li key={i}>{action}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Section E: Reflective Questions */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Questions Worth Reflecting On</h2>
                        <ul className={styles.reflectionList}>
                            {result.reflectiveQuestions.map((q, i) => (
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
