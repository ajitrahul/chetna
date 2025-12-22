'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function ClarityPage() {
    const [question, setQuestion] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<null | {
        observation: string;
        pattern: string;
        guidance: string;
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
                observation: "Current Saturn transit is highlighting your 10th house of career.",
                pattern: "You may feel a tension between 'duty' and 'desire', a classic pattern of resistance to structure.",
                guidance: "This is not a block, but a request for discipline. Small, consistent actions will dissolve the anxiety. Wait 3 days before making big decisions."
            });
        }, 2500);
    };

    return (
        <div className={`container ${styles.pageContainer}`}>
            <h1 className={styles.title}>Ask for Clarity</h1>
            <p className={styles.subtitle}>
                Focus on one pattern or confusion. Receive guidance, not a verdict.
            </p>

            {!result && (
                <form onSubmit={handleAsk} className={styles.inputContainer}>
                    <textarea
                        className={styles.questionInput}
                        placeholder="e.g., 'Why do I feel so stuck in my career right now?'"
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
            )}

            {isAnalyzing && (
                <div className={styles.loadingState}>
                    <div className={styles.orb}></div>
                    <p>Connecting to your chart patterns...</p>
                </div>
            )}

            {result && (
                <div className={styles.resultContainer}>
                    <div className={styles.card}>
                        <h3 className={styles.cardHeader}>Chart Observation</h3>
                        <p>{result.observation}</p>
                    </div>

                    <div className={`${styles.card} ${styles.highlight}`}>
                        <h3 className={styles.cardHeader}>The Pattern</h3>
                        <p>{result.pattern}</p>
                    </div>

                    <div className={styles.card}>
                        <h3 className={styles.cardHeader}>Guidance for Action</h3>
                        <p>{result.guidance}</p>
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
