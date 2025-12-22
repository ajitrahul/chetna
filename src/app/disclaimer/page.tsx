import styles from './page.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Disclaimer | Chetna',
    description: 'Important information about the nature of our astrological services.',
};

export default function DisclaimerPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Disclaimer</h1>

            <div className={styles.content}>
                <div className={styles.section}>
                    <h2>Nature of Services</h2>
                    <p>
                        Chetna is an astrology platform designed for self-awareness and reflection.
                        The insights provided are interpretive and symbolic in nature, based on Vedic astrological principles.
                        They are not deterministic predictions of the future.
                    </p>
                </div>

                <div className={styles.section}>
                    <h2>Not Professional Advice</h2>
                    <p>
                        The content on this platform does not constitute medical, legal, financial, or psychological advice.
                        You should not rely on this information as a substitute for professional counsel.
                        If you are facing a medical emergency or legal crisis, please consult a qualified professional immediately.
                    </p>
                </div>

                <div className={styles.section}>
                    <h2>User Responsibility</h2>
                    <p>
                        You retain full autonomy and responsibility for your life choices and actions.
                        Chetna aims to support you in identifying patterns, but how you navigate those patterns is entirely within your free will.
                        We do not guarantee specific outcomes.
                    </p>
                </div>

                <div className={styles.section}>
                    <h2>Algorithmic Limitations</h2>
                    <p>
                        Our AI models are trained to provide pattern-based guidance. While we strive for accuracy in calculation and relevance in interpretation,
                        automated systems may occasionally produce generalizations that do not fully capture the complexity of your unique human experience.
                    </p>
                </div>
            </div>
        </div>
    );
}
