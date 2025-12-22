import styles from './page.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Timing & Dashas | Chetna',
    description: 'Understand the "weather" of your life through planetary periods.',
};

export default function TimingPage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Your Current Timeline</h1>
                <p className={styles.subtitle}>
                    Planetary periods (Dashas) are not destiny. They are "seasons" that influence your capacity to act, feel, and perceive.
                </p>
            </div>

            {/* Mock Data for Now */}
            <div className={styles.currentPeriod}>
                <div className={styles.periodLabel}>Current Major Phase (Mahadasha)</div>
                <h2 className={styles.periodName}>Jupiter - Saturn</h2>
                <div className={styles.periodDates}>Sep 2024 — Mar 2027</div>
            </div>

            <div className={styles.grid}>
                <div className={styles.card}>
                    <h3>What This Phase Supports</h3>
                    <p>
                        This is a time for structuring your wisdom. Jupiter expands vision, while Saturn demands discipline.
                        Activities that require long-term planning, teaching, or establishing foundational systems are highly supported.
                    </p>
                </div>

                <div className={styles.card}>
                    <h3>What It Resists</h3>
                    <p>
                        Reckless expansion or skipping steps. You may feel a tension between "wanting more" and "feeling restricted."
                        This resistance is actually a protection mechanism to ensure you build sustainably.
                    </p>
                </div>

                <div className={styles.card}>
                    <h3>Emotional Themes</h3>
                    <p>
                        A sense of serious duty. You might feel older or more responsible than usual.
                        Occasional heaviness is normal; it's the weight of maturity settling in.
                    </p>
                </div>
            </div>

            <div className={styles.guidanceBox}>
                <h3 className={styles.guidanceTitle}>How to Work With This Time</h3>
                <p className={styles.guidanceText}>
                    Do not force speed. Verify your foundations. If you feel stuck, it is likely because a structure needs to be respected.
                    Commit to the slow path, and the rewards will be enduring.
                </p>
            </div>
        </div>
    );
}
