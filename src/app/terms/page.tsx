import styles from './page.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | Chetna',
    description: 'Terms and conditions for using the Chetna platform.',
};

export default function TermsPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Terms of Service</h1>
            <p className={styles.lastUpdated}>Last Updated: December 22, 2024</p>

            <div className={styles.content}>
                <section className={styles.section}>
                    <h2>Acceptance of Terms</h2>
                    <p>
                        By accessing and using Chetna ("the Platform"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>Description of Service</h2>
                    <p>
                        Chetna is an awareness-first astrology platform that provides:
                    </p>
                    <ul>
                        <li>Birth chart generation and visualization</li>
                        <li>Pattern-based astrological interpretations</li>
                        <li>AI-assisted reflective guidance</li>
                        <li>Educational content about timing and tendencies</li>
                    </ul>
                    <p>
                        <strong>Important:</strong> Chetna does not provide predictions, guarantees, or deterministic outcomes. All insights are interpretive and designed to support awareness and reflection.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>User Responsibilities</h2>
                    <p>You agree to:</p>
                    <ul>
                        <li>Provide accurate birth information for chart calculations</li>
                        <li>Use the platform for personal reflection and growth only</li>
                        <li>Not rely on astrological insights as a substitute for professional advice (medical, legal, financial, or psychological)</li>
                        <li>Retain full responsibility for your decisions and actions</li>
                        <li>Not misuse or attempt to manipulate the AI features</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>Paid Services</h2>
                    <h3>AI Clarity Questions</h3>
                    <ul>
                        <li>Priced at ₹149 per question or in credit packs</li>
                        <li>Non-refundable once the AI response is generated</li>
                        <li>Credits do not expire and are not auto-renewed</li>
                        <li>We reserve the right to refuse or reframe questions that violate our ethical guidelines</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>Intellectual Property</h2>
                    <p>
                        All content on Chetna, including text, graphics, code, and AI-generated responses, is owned by Chetna or its licensors. You may not reproduce, distribute, or create derivative works without explicit permission.
                    </p>
                    <p>
                        Your birth chart data and questions remain your property, though you grant us a license to use them to provide our services.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>Limitation of Liability</h2>
                    <p>
                        Chetna is provided "as is" without warranties of any kind. We are not liable for:
                    </p>
                    <ul>
                        <li>Decisions made based on astrological insights</li>
                        <li>Accuracy of interpretations or AI responses</li>
                        <li>Any indirect, incidental, or consequential damages</li>
                        <li>Service interruptions or technical issues</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>Prohibited Uses</h2>
                    <p>You may not:</p>
                    <ul>
                        <li>Use the platform for harmful, illegal, or fraudulent purposes</li>
                        <li>Ask questions designed to predict death, illness, or fixed outcomes</li>
                        <li>Attempt to reverse-engineer or scrape our AI models</li>
                        <li>Share your account credentials with others</li>
                        <li>Use the service in a way that increases anxiety or dependency</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>Termination</h2>
                    <p>
                        We reserve the right to suspend or terminate your access to Chetna at any time for violations of these Terms or for any other reason at our discretion.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>Changes to Terms</h2>
                    <p>
                        We may modify these Terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>Governing Law</h2>
                    <p>
                        These Terms are governed by the laws of India. Any disputes will be resolved in the courts of [Your Jurisdiction].
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>Contact</h2>
                    <p>
                        For questions about these Terms, contact us at:<br />
                        Email: legal@chetna.app
                    </p>
                </section>
            </div>
        </div>
    );
}
