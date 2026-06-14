import type { Metadata } from 'next';
import Link from 'next/link';
import { GLOSSARY } from '@/components/Term';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Astrology Glossary in Plain English | AskChetna',
    description: 'A plain-English glossary of Vedic astrology terms — Ascendant, Dasha, Rahu, Ketu, Nakshatra, Navamsa and more, each explained in two sentences with a real-life example.',
};

export default function GlossaryPage() {
    const entries = Object.values(GLOSSARY);

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <div className={styles.hero}>
                    <span className="cosmic-label mb-2">Shabdkosh · Plain English</span>
                    <h1 className="mystic-text text-5xl">Astrology, in Plain English</h1>
                    <div className="sacred-divider"></div>
                    <p className={styles.subtitle}>
                        No jargon, no gatekeeping. Here&apos;s what the key terms actually mean — and what they look like in real life.
                    </p>
                </div>

                <div className={styles.grid}>
                    {entries.map((entry) => (
                        <div key={entry.label} className={styles.card}>
                            <h2 className={styles.term}>{entry.label}</h2>
                            <p className={styles.plain}>{entry.plain}</p>
                            <p className={styles.example}>
                                <span className={styles.exampleLabel}>In real life:</span> {entry.example}
                            </p>
                        </div>
                    ))}
                </div>

                <div className={styles.cta}>
                    <p>Ready to see these in your own chart?</p>
                    <Link href="/chart" className="primary-btn-cosmic">See My Chart</Link>
                </div>
            </div>
        </main>
    );
}
