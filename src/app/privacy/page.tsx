import styles from './page.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | Chetna',
    description: 'How Chetna collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Privacy Policy</h1>
            <p className={styles.lastUpdated}>Last Updated: December 22, 2024</p>

            <div className={styles.content}>
                <section className={styles.section}>
                    <h2>Introduction</h2>
                    <p>
                        Chetna ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our astrology platform.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>Information We Collect</h2>
                    <h3>Personal Information</h3>
                    <ul>
                        <li><strong>Birth Data:</strong> Date, time, and place of birth for chart calculations</li>
                        <li><strong>Account Information:</strong> Email address, name (if provided)</li>
                        <li><strong>Questions:</strong> Text of questions you ask through our AI Clarity feature</li>
                        <li><strong>Payment Information:</strong> Processed securely through third-party payment processors; we do not store full credit card details</li>
                    </ul>

                    <h3>Automatically Collected Information</h3>
                    <ul>
                        <li>Device information (browser type, operating system)</li>
                        <li>Usage data (pages visited, features used)</li>
                        <li>IP address and general location</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>How We Use Your Information</h2>
                    <ul>
                        <li>To generate and display your astrological charts</li>
                        <li>To provide AI-assisted guidance and reflections</li>
                        <li>To process payments for paid features</li>
                        <li>To improve our services and user experience</li>
                        <li>To send important updates about our service (no marketing emails without consent)</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>Data Storage and Security</h2>
                    <p>
                        We use industry-standard encryption and security measures to protect your data. Your birth information and questions are stored securely and are not shared with third parties except as necessary to provide our services (e.g., payment processing).
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul>
                        <li>Access your personal data</li>
                        <li>Request correction of inaccurate data</li>
                        <li>Request deletion of your data</li>
                        <li>Opt-out of communications</li>
                        <li>Export your data</li>
                    </ul>
                    <p>To exercise these rights, contact us at privacy@chetna.app</p>
                </section>

                <section className={styles.section}>
                    <h2>Third-Party Services</h2>
                    <p>
                        We use third-party services for payment processing, analytics, and hosting. These services have their own privacy policies and we encourage you to review them.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on our website or sending an email.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>Contact Us</h2>
                    <p>
                        If you have questions about this Privacy Policy, please contact us at:<br />
                        Email: privacy@chetna.app
                    </p>
                </section>
            </div>
        </div>
    );
}
