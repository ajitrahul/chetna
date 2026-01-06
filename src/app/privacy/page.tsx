import styles from '../legal.module.css';
import Link from 'next/link';

export const metadata = {
    title: 'Privacy Policy - Chetna',
    description: 'Privacy Policy for Chetna - Your data security and privacy matters to us.',
};

export default function PrivacyPage() {
    return (
        <main className={styles.legalPage}>
            <div className={styles.container}>
                <h1>Privacy Policy</h1>
                <p className={styles.lastUpdated}>Last Updated: January 6, 2026</p>

                <section>
                    <h2>1. Introduction</h2>
                    <p>
                        Welcome to Chetna ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our astrological services platform.
                    </p>
                </section>

                <section>
                    <h2>2. Information We Collect</h2>
                    <h3>Personal Information</h3>
                    <p>We collect the following personal information when you register and use our services:</p>
                    <ul>
                        <li><strong>Account Information:</strong> Name, email address, phone number</li>
                        <li><strong>Birth Details:</strong> Date of birth, time of birth, place of birth (city, country, coordinates)</li>
                        <li><strong>Profile Information:</strong> Gender, profile picture (if provided via Google OAuth)</li>
                        <li><strong>Relationship Data:</strong> For synastry services, partner's birth details (if voluntarily provided)</li>
                    </ul>

                    <h3>Automatically Collected Information</h3>
                    <ul>
                        <li><strong>Usage Data:</strong> Pages visited, features accessed, time spent on the platform</li>
                        <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                        <li><strong>Location Data:</strong> General geographic location based on IP address</li>
                        <li><strong>Analytics Data:</strong> Interaction patterns, feature usage, session data</li>
                    </ul>

                    <h3>Payment Information</h3>
                    <p>
                        Payment transactions are processed securely through third-party payment processors (Razorpay). We do not store your complete credit card or banking information on our servers. We only retain transaction IDs and purchase history.
                    </p>
                </section>

                <section>
                    <h2>3. How We Use Your Information</h2>
                    <p>We use the collected information for the following purposes:</p>
                    <ul>
                        <li><strong>Service Delivery:</strong> To calculate and generate personalized astrological charts, reports, and insights based on your birth details</li>
                        <li><strong>Account Management:</strong> To create and maintain your user account, manage your credits, and track service usage</li>
                        <li><strong>Personalization:</strong> To provide customized horoscopes, recommendations, and astrological guidance</li>
                        <li><strong>Communication:</strong> To send you service updates, newsletters (if subscribed), and respond to your inquiries</li>
                        <li><strong>Payment Processing:</strong> To process transactions and maintain billing records</li>
                        <li><strong>Analytics:</strong> To understand usage patterns, improve our services, and develop new features</li>
                        <li><strong>Security:</strong> To detect and prevent fraud, abuse, and security threats</li>
                        <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Data Sharing and Disclosure</h2>
                    <p>We do not sell your personal information. We may share your data in the following circumstances:</p>

                    <h3>Third-Party Service Providers</h3>
                    <ul>
                        <li><strong>Authentication:</strong> Google OAuth for secure sign-in</li>
                        <li><strong>Payment Processing:</strong> Razorpay for secure payment transactions</li>
                        <li><strong>Email Services:</strong> For sending transactional emails and newsletters</li>
                        <li><strong>Analytics:</strong> For tracking and analyzing platform usage</li>
                        <li><strong>Cloud Hosting:</strong> For secure data storage and platform hosting</li>
                    </ul>

                    <h3>Legal Requirements</h3>
                    <p>We may disclose your information if required by law, court order, or governmental authority, or to protect our rights and safety.</p>

                    <h3>Business Transfers</h3>
                    <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.</p>
                </section>

                <section>
                    <h2>5. Data Security</h2>
                    <p>
                        We implement industry-standard security measures to protect your personal information, including:
                    </p>
                    <ul>
                        <li>Encrypted data transmission (SSL/TLS)</li>
                        <li>Secure database storage with access controls</li>
                        <li>Password hashing using bcrypt</li>
                        <li>Regular security audits and updates</li>
                        <li>Limited employee access to personal data</li>
                    </ul>
                    <p>
                        However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                    </p>
                </section>

                <section>
                    <h2>6. Your Privacy Rights</h2>
                    <p>You have the following rights regarding your personal information:</p>
                    <ul>
                        <li><strong>Access:</strong> You can request a copy of the personal data we hold about you</li>
                        <li><strong>Correction:</strong> You can update or correct your personal information through your account settings</li>
                        <li><strong>Deletion:</strong> You can request deletion of your account and associated data (subject to legal retention requirements)</li>
                        <li><strong>Portability:</strong> You can request a copy of your data in a structured, machine-readable format</li>
                        <li><strong>Opt-Out:</strong> You can unsubscribe from marketing emails at any time</li>
                        <li><strong>Withdraw Consent:</strong> You can withdraw consent for data processing where applicable</li>
                    </ul>
                    <p>
                        To exercise these rights, please contact us at <a href="mailto:privacy@chetna.com">privacy@chetna.com</a>.
                    </p>
                </section>

                <section>
                    <h2>7. Data Retention</h2>
                    <p>
                        We retain your personal information for as long as your account is active or as needed to provide services. After account deletion, we may retain certain information for:
                    </p>
                    <ul>
                        <li>Legal and regulatory compliance (typically 7 years for financial records)</li>
                        <li>Dispute resolution and fraud prevention</li>
                        <li>Anonymized analytics (with all personally identifiable information removed)</li>
                    </ul>
                </section>

                <section>
                    <h2>8. Cookies and Tracking Technologies</h2>
                    <p>
                        We use cookies and similar technologies to enhance your experience, analyze usage, and remember your preferences. You can control cookie settings through your browser, but disabling cookies may affect platform functionality.
                    </p>
                </section>

                <section>
                    <h2>9. Children's Privacy</h2>
                    <p>
                        Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected data from a minor, please contact us immediately.
                    </p>
                </section>

                <section>
                    <h2>10. International Data Transfers</h2>
                    <p>
                        Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers in compliance with applicable data protection laws.
                    </p>
                </section>

                <section>
                    <h2>11. Changes to This Privacy Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a prominent notice on our platform. Your continued use of our services after changes constitutes acceptance of the updated policy.
                    </p>
                </section>

                <section>
                    <h2>12. Contact Us</h2>
                    <p>
                        If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:
                    </p>
                    <ul>
                        <li>Email: <a href="mailto:privacy@chetna.com">privacy@chetna.com</a></li>
                        <li>Email (General): <a href="mailto:support@chetna.com">support@chetna.com</a></li>
                    </ul>
                </section>

                <div className={styles.backLink}>
                    <Link href="/">← Back to Home</Link>
                </div>
            </div>
        </main>
    );
}
