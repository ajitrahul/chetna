'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';

export default function OnboardingPage() {
    const router = useRouter();
    const [currentScreen, setCurrentScreen] = useState(1);

    const nextScreen = () => {
        if (currentScreen < 4) {
            setCurrentScreen(currentScreen + 1);
        } else {
            // Mark onboarding as complete and redirect to homepage
            if (typeof window !== 'undefined') {
                localStorage.setItem('chetna_onboarding_complete', 'true');
            }
            router.push('/');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.progressBar}>
                {[1, 2, 3, 4].map((step) => (
                    <div
                        key={step}
                        className={`${styles.progressDot} ${step <= currentScreen ? styles.activeDot : ''}`}
                    />
                ))}
            </div>

            <div className={styles.screenContainer}>
                {/* Screen 1: Welcome */}
                {currentScreen === 1 && (
                    <div className={styles.screen}>
                        <div className={styles.iconBox}>
                            <Sparkles size={48} color="var(--accent-gold)" />
                        </div>
                        <h1 className={styles.title}>Welcome to Chetna</h1>
                        <p className={styles.content}>
                            Chetna is an awareness-first astrology platform.
                            <br /><br />
                            Here, astrology is used to understand patterns and timing — not to predict outcomes.
                        </p>
                    </div>
                )}

                {/* Screen 2: What to Expect */}
                {currentScreen === 2 && (
                    <div className={styles.screen}>
                        <h1 className={styles.title}>What You&apos;ll Find Here</h1>
                        <ul className={styles.featureList}>
                            <li><CheckCircle size={20} /> Insights into your birth chart</li>
                            <li><CheckCircle size={20} /> Understanding of current phases and timing</li>
                            <li><CheckCircle size={20} /> Guidance on actions, habits, and communication</li>
                            <li><CheckCircle size={20} /> AI-assisted reflection for thoughtful questions</li>
                        </ul>
                        <p className={styles.note}>
                            Everything is designed to support clarity and responsibility.
                        </p>
                    </div>
                )}

                {/* Screen 3: What You Won't Find */}
                {currentScreen === 3 && (
                    <div className={styles.screen}>
                        <h1 className={styles.title}>What Chetna Does <span style={{ color: 'var(--accent-rose)' }}>NOT</span> Do</h1>
                        <ul className={styles.noList}>
                            <li>No fear-based predictions</li>
                            <li>No guarantees or verdicts</li>
                            <li>No pressure to keep asking questions</li>
                            <li>No replacement for your own judgement</li>
                        </ul>
                        <p className={styles.note}>
                            Chetna supports thinking — it does not decide for you.
                        </p>
                    </div>
                )}

                {/* Screen 4: How to Use Well */}
                {currentScreen === 4 && (
                    <div className={styles.screen}>
                        <h1 className={styles.title}>A Gentle Note Before You Begin</h1>
                        <div className={styles.guidanceBox}>
                            <p>✓ Ask focused, reflective questions</p>
                            <p>✓ Use insights as guidance, not instructions</p>
                            <p>✓ Take time to act on awareness</p>
                            <p>✓ Return when you&apos;re ready — not out of urgency</p>
                        </div>
                        <p className={styles.note}>
                            Astrology works best when paired with conscious action.
                        </p>
                    </div>
                )}
            </div>

            <button onClick={nextScreen} className={styles.nextBtn}>
                {currentScreen < 4 ? (
                    <>
                        Continue <ArrowRight size={18} />
                    </>
                ) : (
                    'Begin with Awareness'
                )}
            </button>
        </div>
    );
}
