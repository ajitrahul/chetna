'use client';

import { useState } from 'react';
import styles from './page.module.css';
import ProfileManager, { UserProfile } from '@/components/ProfileManager';

export default function SynastryPage() {
    const [personA, setPersonA] = useState<UserProfile | null>(null);
    const [personB, setPersonB] = useState<UserProfile | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showResult, setShowResult] = useState(false);

    const handleAnalyze = () => {
        setIsAnalyzing(true);
        setShowResult(false);

        // Mock analysis delay
        setTimeout(() => {
            setIsAnalyzing(false);
            setShowResult(true);
        }, 1500);
    };

    return (
        <div className={`container ${styles.container}`}>
            <h1 className={styles.title}>Relationship Dynamics</h1>
            <p className={styles.subtitle}>
                Understand the flow of energy between two charts. No judgments, just patterns.
            </p>

            <div className={styles.selectorGrid}>
                <div className={styles.profileSlot}>
                    <h3>Person A</h3>
                    {personA ? (
                        <div className={styles.selectedCard}>
                            <span className={styles.name}>{personA.name}</span>
                            <button onClick={() => { setPersonA(null); setShowResult(false); }} className={styles.changeBtn}>Change</button>
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <p>Select a profile</p>
                            <ProfileManager onSelectProfile={setPersonA} />
                        </div>
                    )}
                </div>

                <div className={styles.connector}>+</div>

                <div className={styles.profileSlot}>
                    <h3>Person B</h3>
                    {personB ? (
                        <div className={styles.selectedCard}>
                            <span className={styles.name}>{personB.name}</span>
                            <button onClick={() => { setPersonB(null); setShowResult(false); }} className={styles.changeBtn}>Change</button>
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <p>Select a profile</p>
                            <ProfileManager onSelectProfile={setPersonB} />
                        </div>
                    )}
                </div>
            </div>

            <button
                className={styles.analyzeBtn}
                disabled={!personA || !personB || isAnalyzing}
                onClick={handleAnalyze}
            >
                {isAnalyzing ? 'Connecting Charts...' : 'Analyze Synergy'}
            </button>

            {showResult && (
                <div className={styles.resultSection}>
                    <div className={styles.vennContainer}>
                        <div className={`${styles.circle} ${styles.circleA}`}>
                            {personA?.name.split(' ')[0]}
                        </div>
                        <div className={`${styles.circle} ${styles.circleB}`}>
                            {personB?.name.split(' ')[0]}
                        </div>
                        <div className={styles.intersectionLabel}>Growth</div>
                    </div>

                    <div className={styles.insightsList}>
                        <div className={styles.insightCard}>
                            <h4>Magnetic Pull</h4>
                            <p>Your Moons are in trine, creating an effortless emotional understanding. You instinctively know how the other feels without words.</p>
                        </div>
                        <div className={styles.insightCard}>
                            <h4>Growth Edge</h4>
                            <p>Saturn squaring the Sun indicates a relationship where you teach each other responsibility. It may feel heavy at times, but it builds lasting structures.</p>
                        </div>
                        <div className={styles.insightCard}>
                            <h4>Communication Flow</h4>
                            <p>Mercury in opposite signs suggests you see the world from different ends of the spectrum. This requires patience but leads to holistic decision making.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
