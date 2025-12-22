'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import styles from './JournalWidget.module.css';

export default function JournalWidget() {
    const today = new Date().toISOString().split('T')[0];
    const [entries, setEntries] = useLocalStorage<Record<string, string>>('chetna_journal', {});
    const [currentEntry, setCurrentEntry] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (entries[today]) {
            setCurrentEntry(entries[today]);
        }
    }, [entries, today]);

    const handleSave = () => {
        setEntries({
            ...entries,
            [today]: currentEntry
        });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
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
                    {isSaved ? 'Saved to your device' : 'Unsaved changes'}
                </span>
                <button 
                    onClick={handleSave} 
                    className={styles.saveBtn}
                    disabled={isSaved}
                >
                    Save Reflection
                </button>
            </div>
        </div>
    );
}
