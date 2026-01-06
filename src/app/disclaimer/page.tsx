import styles from '../legal.module.css';
import Link from 'next/link';

export const metadata = {
    title: 'Disclaimer - Chetna',
    description: 'Important disclaimers for using Chetna astrological services.',
};

export default function DisclaimerPage() {
    return (
        <main className={styles.legalPage}>
            <div className={styles.container}>
                <h1>Disclaimer</h1>
                <p className={styles.lastUpdated}>Last Updated: January 6, 2026</p>

                <div className={styles.importantNotice}>
                    <h2>⚠️ Important Notice</h2>
                    <p>
                        Please read this disclaimer carefully before using Chetna's services. By accessing or using our platform, you acknowledge that you have read, understood, and agree to be bound by this disclaimer.
                    </p>
                </div>

                <section>
                    <h2>1. Nature of Astrological Services</h2>
                    <p>
                        Chetna provides astrological interpretations, insights, and guidance based on Vedic astrology principles, planetary positions, and birth chart calculations. Our services are intended for:
                    </p>
                    <ul>
                        <li><strong>Self-awareness and personal growth</strong></li>
                        <li><strong>Reflection and introspection</strong></li>
                        <li><strong>Entertainment and curiosity</strong></li>
                        <li><strong>Cultural and spiritual exploration</strong></li>
                    </ul>
                    <p>
                        <strong>Astrology is NOT a science</strong> and should not be treated as factual, predictive, or deterministic. Our interpretations are based on traditional astrological systems and AI-enhanced insights, but they represent possibilities and tendencies, not certainties.
                    </p>
                </section>

                <section>
                    <h2>2. Not a Substitute for Professional Advice</h2>
                    <div className={styles.warningBox}>
                        <p>
                            The astrological insights and guidance provided by Chetna are <strong>NOT a substitute</strong> for professional advice from qualified experts in the following areas:
                        </p>
                        <ul>
                            <li><strong>Medical or Mental Health:</strong> Astrology cannot diagnose, treat, or cure any medical or psychological condition. If you are experiencing health issues, please consult a licensed healthcare professional.</li>
                            <li><strong>Legal Matters:</strong> Astrology cannot provide legal guidance. For legal issues, consult a qualified attorney.</li>
                            <li><strong>Financial or Investment Decisions:</strong> Astrological insights should never be used as the sole basis for financial decisions. Consult a certified financial advisor.</li>
                            <li><strong>Career or Employment:</strong> While astrology may offer insights into your strengths, career decisions should be based on professional counseling and objective analysis.</li>
                            <li><strong>Relationship or Marriage Counseling:</strong> For serious relationship issues, seek guidance from licensed therapists or counselors.</li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h2>3. No Guarantees or Predictions</h2>
                    <p>
                        Chetna does not guarantee the accuracy, completeness, or reliability of any astrological interpretation or insight. We do not claim to:
                    </p>
                    <ul>
                        <li>Predict the future with certainty</li>
                        <li>Provide definitive answers to life questions</li>
                        <li>Control or influence cosmic or karmic forces</li>
                        <li>Guarantee specific outcomes in any aspect of your life</li>
                    </ul>
                    <p>
                        Astrological insights represent <strong>interpretive possibilities</strong> based on planetary positions and traditional wisdom. Individual experiences and outcomes vary widely.
                    </p>
                </section>

                <section>
                    <h2>4. AI-Generated Content</h2>
                    <p>
                        Some features on our platform use AI (Artificial Intelligence) to generate personalized astrological interpretations and responses. While we strive for quality and relevance:
                    </p>
                    <ul>
                        <li>AI-generated content may occasionally contain inaccuracies or inconsistencies</li>
                        <li>AI cannot replace human intuition, wisdom, or professional expertise</li>
                        <li>The AI is trained on astrological principles but is not infallible</li>
                    </ul>
                    <p>
                        You should use AI-generated insights as supplementary information, not as absolute truth.
                    </p>
                </section>

                <section>
                    <h2>5. Personal Responsibility</h2>
                    <div className={styles.warningBox}>
                        <p>
                            <strong>YOU ARE SOLELY RESPONSIBLE FOR YOUR DECISIONS AND ACTIONS.</strong>
                        </p>
                        <p>
                            By using Chetna's services, you acknowledge that:
                        </p>
                        <ul>
                            <li>You will not make critical life decisions based solely on astrological insights</li>
                            <li>You understand astrology is interpretive and subjective</li>
                            <li>You will seek professional advice for serious matters (health, legal, financial)</li>
                            <li>You will not hold Chetna liable for any consequences of your decisions</li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h2>6. Accuracy of Birth Data</h2>
                    <p>
                        The accuracy of astrological charts and interpretations depends heavily on the accuracy of the birth data you provide (date, time, and place of birth). We are not responsible for:
                    </p>
                    <ul>
                        <li>Inaccurate or incorrect birth details entered by you</li>
                        <li>Approximate or unknown birth times</li>
                        <li>Timezone or location errors</li>
                    </ul>
                    <p>
                        For the most accurate results, ensure your birth information is as precise as possible.
                    </p>
                </section>

                <section>
                    <h2>7. Third-Party Links and Services</h2>
                    <p>
                        Our platform may contain links to third-party websites or services (e.g., payment gateways, authentication providers). We are not responsible for:
                    </p>
                    <ul>
                        <li>The content, privacy practices, or terms of third-party sites</li>
                        <li>Any transactions or interactions with third parties</li>
                        <li>Damage or loss resulting from third-party services</li>
                    </ul>
                    <p>
                        Your use of third-party services is at your own risk and subject to their respective terms and policies.
                    </p>
                </section>

                <section>
                    <h2>8. No Liability</h2>
                    <p>
                        To the fullest extent permitted by law, Chetna and its operators, employees, affiliates, and partners shall not be liable for any:
                    </p>
                    <ul>
                        <li>Direct, indirect, incidental, or consequential damages arising from your use of our services</li>
                        <li>Decisions, actions, or outcomes based on astrological insights</li>
                        <li>Emotional distress, financial loss, or personal injury</li>
                        <li>Loss of data, interruptions, or technical errors</li>
                    </ul>
                </section>

                <section>
                    <h2>9. Cultural and Religious Sensitivity</h2>
                    <p>
                        Chetna's services are rooted in Vedic astrology, a system originating from ancient Indian traditions. We respect all cultural and religious beliefs. Our interpretations are not intended to:
                    </p>
                    <ul>
                        <li>Replace your religious or spiritual practices</li>
                        <li>Conflict with your personal beliefs</li>
                        <li>Make claims about divine will or fate</li>
                    </ul>
                    <p>
                        If any content conflicts with your beliefs, please discontinue use or consult your spiritual advisor.
                    </p>
                </section>

                <section>
                    <h2>10. Changes to This Disclaimer</h2>
                    <p>
                        We reserve the right to update or modify this disclaimer at any time. Changes will be posted on this page with an updated "Last Updated" date. Your continued use of our services after changes constitutes acceptance of the updated disclaimer.
                    </p>
                </section>

                <section>
                    <h2>11. Contact Us</h2>
                    <p>
                        If you have questions or concerns about this disclaimer, please contact us:
                    </p>
                    <ul>
                        <li>Email: <a href="mailto:support@chetna.com">support@chetna.com</a></li>
                        <li>Legal: <a href="mailto:legal@chetna.com">legal@chetna.com</a></li>
                    </ul>
                </section>

                <div className={styles.backLink}>
                    <Link href="/">← Back to Home</Link>
                </div>
            </div>
        </main>
    );
}
