'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import styles from './JournalWidget.module.css';

export default function JournalWidget() {
    const { data: session } = useSession();
    const today = new Date().toISOString().split('T')[0];
    const [localEntries, setLocalEntries] = useLocalStorage<Record<string, string>>('chetna_journal', {});
    const [currentEntry, setCurrentEntry] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    const fetchEntryFromDB = useCallback(async () => {
        try {
            const res = await fetch(`/api/journal?date=${today}`);
            if (res.ok) {
                const data = await res.json();
                setCurrentEntry(data.content || '');
                setIsSaved(true);
            }
        } catch (err) {
            console.error('Failed to fetch from DB:', err);
        }
    }, [today]);

    // Load initial entry
    useEffect(() => {
        if (session) {
            fetchEntryFromDB();
        } else {
            if (localEntries[today]) {
                setCurrentEntry(localEntries[today]);
            }
        }
    }, [session, today, fetchEntryFromDB, localEntries]);

    const handleSave = async () => {
        setLoading(true);
        try {
            if (session) {
                const res = await fetch('/api/journal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        date: today,
                        content: currentEntry,
                    }),
                });
                if (res.ok) {
                    setIsSaved(true);
                }
            } else {
                setLocalEntries({
                    ...localEntries,
                    [today]: currentEntry
                });
                setIsSaved(true);
            }
        } catch (err) {
            console.error('Save failed:', err);
        } finally {
            setLoading(false);
            setTimeout(() => setIsSaved(false), 3000);
        }
    };

    const handleAnalyze = async () => {
        if (!currentEntry || currentEntry.length < 10) return;
        setAnalyzing(true);
        setAnalysis(null);
        try {
            const res = await fetch('/api/journal/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: today,
                    content: currentEntry,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setAnalysis(data);
            }
        } catch (err) {
            console.error('Analysis failed:', err);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className={styles.widget}>
            <div className={styles.header}>
                <h3 className={styles.title}>Daily Reflection</h3>
                <span className={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>

            <textarea
                className={styles.textarea}
                value={currentEntry}
                onChange={(e) => {
                    setCurrentEntry(e.target.value);
                    setIsSaved(false);
                }}
                placeholder="How is the energy manifesting for you today? Record your observations..."
            />

            <div className={styles.footer}>
                <span className={styles.status}>
                    {isSaved ? 'Your reflection is saved' : 'You have unsaved thoughts'}
                </span>
                <div className={styles.btns}>
                    {session && (
                        <button
                            onClick={handleAnalyze}
                            className={styles.analyzeBtn}
                            disabled={analyzing || !currentEntry || currentEntry.length < 10}
                        >
                            {analyzing ? 'Analyzing...' : 'Analyze Patterns'}
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        className={styles.saveBtn}
                        disabled={isSaved || loading}
                    >
                        {loading ? 'Saving...' : 'Save Reflection'}
                    </button>
                </div>
            </div>

            {analysis && (
                <div className={styles.analysisBox}>
                    <h4>Timing Insights</h4>
                    <div className={styles.insight}>
                        <span className={styles.insightLabel}>Correlation</span>
                        <p className={styles.insightText}>{analysis.correlation}</p>
                    </div>
                    <div className={styles.insight}>
                        <span className={styles.insightLabel}>Astrological Phase</span>
                        <p className={styles.insightText}>{analysis.astrologicalContext}</p>
                    </div>
                    <div className={styles.insight}>
                        <span className={styles.insightLabel}>Growth Guidance</span>
                        <p className={styles.insightText}>{analysis.growthSuggestion}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
