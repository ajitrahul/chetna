'use client';

import { useState } from 'react';
import BirthDataForm from '@/components/BirthDataForm';
import styles from './page.module.css';
import ChartDisplay from '@/components/ChartDisplay';

type PlacementData = {
    id: string;
    title: string;
    indicates: string;
    patterns: string[];
    helps: string[];
    avoid: string[];
    freeWill: string;
};

// Mock placement data based on reference requirements
const MOCK_PLACEMENTS: PlacementData[] = [
    {
        id: 'sun-leo',
        title: 'Sun in Leo (1st House)',
        indicates: 'Strong sense of identity and self-expression. Natural leadership qualities with a need for recognition and creative output.',
        patterns: [
            'Tendency to take center stage in group settings',
            'Pride in personal achievements and self-presentation',
            'Vulnerability to criticism affecting self-worth',
            'Need for validation through external recognition'
        ],
        helps: [
            'Creative pursuits that allow authentic self-expression',
            'Leadership roles with clear boundaries',
            'Regular acknowledgment of your contributions',
            'Environments that celebrate individuality'
        ],
        avoid: [
            'Suppressing your natural charisma or playing small',
            'Seeking validation only through others\' approval',
            'Dominating conversations or overshadowing others',
            'Taking criticism as personal attacks'
        ],
        freeWill: 'This placement shows a natural tendency, not a fixed destiny. You can choose how to express your Leo energy — through healthy confidence or through ego-driven behavior. Awareness of these patterns gives you the power to respond consciously.'
    },
    {
        id: 'moon-aries',
        title: 'Moon in Aries (4th House)',
        indicates: 'Emotional reactivity and a need for independence in feeling secure. Quick to feel, quick to act on emotions.',
        patterns: [
            'Immediate emotional responses without processing',
            'Restlessness when feeling emotionally constrained',
            'Need for emotional autonomy and space',
            'Tendency to initiate rather than reflect in emotional situations'
        ],
        helps: [
            'Physical activity to process emotional energy',
            'Quick decision-making when clarity is present',
            'Independence in living situations',
            'Direct communication about emotional needs'
        ],
        avoid: [
            'Impulsive reactions during emotional upset',
            'Isolating yourself when support is needed',
            'Starting conflicts to feel alive or engaged',
            'Expecting others to match your emotional pace'
        ],
        freeWill: 'You are not your first reaction. This Moon placement reveals your default emotional setting, but you retain the choice to pause, observe, and respond rather than react. Your awareness is the bridge between pattern and freedom.'
    },
    {
        id: 'jupiter-sagittarius',
        title: 'Jupiter in Sagittarius (10th House)',
        indicates: 'Expansion through knowledge, teaching, and philosophical exploration. Career growth tied to educational or ethical pursuits.',
        patterns: [
            'Natural optimism about long-term goals and possibilities',
            'Tendency to overcommit or overestimate timelines',
            'Attraction to roles involving teaching, travel, or belief systems',
            'Need for meaning and purpose in professional life'
        ],
        helps: [
            'Roles that involve mentorship or knowledge sharing',
            'Setting realistic timelines with built-in flexibility',
            'Continuous learning and skill development',
            'Aligning career with personal values and ethics'
        ],
        avoid: [
            'Promising more than you can realistically deliver',
            'Pursuing opportunities solely for expansion without substance',
            'Dogmatic thinking or forcing beliefs on others',
            'Neglecting practical details in favor of big visions'
        ],
        freeWill: 'Jupiter amplifies — but you decide what gets amplified. This placement offers opportunities for growth, but those opportunities require conscious effort, not just optimism. Your choices determine whether expansion leads to wisdom or overwhelm.'
    }
];

export default function ChartPage() {
    const [selectedPlacement, setSelectedPlacement] = useState<PlacementData>(MOCK_PLACEMENTS[0]);
    const [activeChart, setActiveChart] = useState<any>(null);

    const handleChartGenerated = (data: any) => {
        setActiveChart(data);
        // Scroll to chart
        document.getElementById('chart-display-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className={`container ${styles.pageContainer}`}>
            <h1 className={styles.title}>Explore Your Chart</h1>
            <p className={styles.subtitle}>
                Enter your birth details to uncover the patterns and timing in your life.
            </p>

            <div className={styles.formWrapper}>
                <BirthDataForm onChartGenerated={handleChartGenerated} />
            </div>

            {activeChart && (
                <div id="chart-display-section" className={styles.chartSection}>
                    <h2 className={styles.chartTitle}>
                        Your Personal Chart
                    </h2>
                    <ChartDisplay data={activeChart} />
                </div>
            )}

            {/* Placement Explanation Tabs */}
            <div className={styles.placementSection}>
                <h2 className={styles.sectionTitle}>Understanding Your Placements</h2>
                <p className={styles.sectionSubtitle}>
                    Explore the psychological patterns and themes associated with key placements in your chart.
                </p>

                {/* Tab Navigation */}
                <div className={styles.tabNav}>
                    {MOCK_PLACEMENTS.map((placement) => (
                        <button
                            key={placement.id}
                            onClick={() => setSelectedPlacement(placement)}
                            className={`${styles.tab} ${selectedPlacement.id === placement.id ? styles.activeTab : ''}`}
                        >
                            {placement.title}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className={styles.tabContent}>
                    <div className={styles.contentBlock}>
                        <h3>What This Placement Often Indicates</h3>
                        <p>{selectedPlacement.indicates}</p>
                    </div>

                    <div className={styles.contentBlock}>
                        <h3>Common Psychological Patterns</h3>
                        <ul>
                            {selectedPlacement.patterns.map((pattern, i) => (
                                <li key={i}>{pattern}</li>
                            ))}
                        </ul>
                    </div>

                    <div className={`${styles.contentBlock} ${styles.helpsBlock}`}>
                        <h3>What Helps During This Phase</h3>
                        <ul>
                            {selectedPlacement.helps.map((help, i) => (
                                <li key={i}>{help}</li>
                            ))}
                        </ul>
                    </div>

                    <div className={styles.contentBlock}>
                        <h3>What to Avoid</h3>
                        <ul>
                            {selectedPlacement.avoid.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    <div className={`${styles.contentBlock} ${styles.freeWillBlock}`}>
                        <h3>Your Free Will</h3>
                        <p>{selectedPlacement.freeWill}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
