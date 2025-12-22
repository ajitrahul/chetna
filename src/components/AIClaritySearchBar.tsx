'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles } from 'lucide-react';
import styles from './AIClaritySearchBar.module.css';

export default function AIClaritySearchBar() {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || query.length < 10) return;

        // Redirect to clarity page with question as query param
        router.push(`/clarity?q=${encodeURIComponent(query)}`);
    };

    return (
        <div className={styles.searchWrapper}>
            <form onSubmit={handleSubmit} className={styles.searchForm}>
                <div className={styles.inputIcon}>
                    <Sparkles size={18} className={styles.sparkleIcon} />
                </div>
                <input
                    type="text"
                    placeholder="How should I approach my career path right now?"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={styles.searchInput}
                />
                <button type="submit" className={styles.searchBtn} disabled={query.length < 10}>
                    <span>Ask Chetna</span>
                    <Search size={18} />
                </button>
            </form>
            <p className={styles.hint}>
                Ask about patterns, timing, or awareness. No predictions.
            </p>
        </div>
    );
}
