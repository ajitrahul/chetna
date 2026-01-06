import styles from '../legal.module.css';
import Link from 'next/link';

export const metadata = {
    title: 'Refund Policy - Chetna',
    description: 'Refund and cancellation policy for Chetna services.',
};

export default function RefundPage() {
    return (
        <main className={styles.legalPage}>
            <div className={styles.container}>
                <h1>Refund Policy</h1>
                <p className={styles.lastUpdated}>Last Updated: January 6, 2026</p>

                <section>
                    <h2>1. Overview</h2>
                    <p>
                        At Chetna, we strive to provide high-quality astrological services and ensure customer satisfaction. This Refund Policy outlines the circumstances under which refunds may be issued for purchases made on our platform.
                    </p>
                    <p>
                        <strong>Important:</strong> Due to the digital and personalized nature of our services, most purchases are final and non-refundable. Please review this policy carefully before making a purchase.
                    </p>
                </section>

                <section>
                    <h2>2. Non-Refundable Items and Services</h2>
                    <p>
                        The following are generally <strong>non-refundable</strong>:
                    </p>
                    <ul>
                        <li><strong>Credits and Pricing Plans:</strong> Once purchased, credits are non-refundable and non-transferable. This includes all credit packages and subscription plans.</li>
                        <li><strong>Digital Reports:</strong> Personalized PDF reports, birth charts, and other downloadable content are non-refundable once generated and delivered.</li>
                        <li><strong>AI Clarity Sessions:</strong> Questions submitted to our AI astrologer are non-refundable once processed and answered.</li>
                        <li><strong>Unlocked Charts and Services:</strong> Once a chart (e.g., Navamsa, Dasamsa, Transit) or service has been unlocked and accessed using credits, it is non-refundable.</li>
                        <li><strong>Promotional Credits:</strong> Free or promotional credits cannot be refunded or exchanged for cash.</li>
                    </ul>
                </section>

                <section>
                    <h2>3. Eligible Refund Scenarios</h2>
                    <p>
                        Refunds may be considered in the following limited circumstances:
                    </p>

                    <h3>3.1 Technical Errors</h3>
                    <p>
                        If you experience a technical issue that prevents you from accessing a paid service (e.g., payment was deducted but credits were not added, service failed to load), please contact us within <strong>48 hours</strong> of the transaction. We will investigate and, if confirmed, issue a refund or credit adjustment.
                    </p>

                    <h3>3.2 Duplicate Charges</h3>
                    <p>
                        If you were charged multiple times for the same transaction due to a system error, the duplicate charges will be refunded promptly upon verification.
                    </p>

                    <h3>3.3 Unauthorized Transactions</h3>
                    <p>
                        If you believe a transaction was made without your authorization, please contact us immediately. We will work with you and our payment processor to investigate and resolve the issue.
                    </p>

                    <h3>3.4 Service Not Delivered</h3>
                    <p>
                        If a paid service was not delivered due to our error (e.g., report generation failed, chart did not load), we will either re-deliver the service or issue a full refund at your discretion.
                    </p>
                </section>

                <section>
                    <h2>4. Refund Request Process</h2>
                    <p>
                        To request a refund, please follow these steps:
                    </p>
                    <ol>
                        <li>Contact us at <a href="mailto:support@chetna.com">support@chetna.com</a> or <a href="mailto:refunds@chetna.com">refunds@chetna.com</a></li>
                        <li>Include the following information in your email:
                            <ul>
                                <li>Your registered email address or user ID</li>
                                <li>Transaction ID or payment reference number</li>
                                <li>Date and amount of the transaction</li>
                                <li>Reason for the refund request</li>
                                <li>Supporting evidence (e.g., screenshots of errors, proof of duplicate charges)</li>
                            </ul>
                        </li>
                        <li>Our team will review your request within <strong>5-7 business days</strong> and respond with a decision.</li>
                    </ol>
                    <p>
                        <strong>Note:</strong> Refund requests submitted more than 30 days after the transaction may not be eligible for review.
                    </p>
                </section>

                <section>
                    <h2>5. Refund Processing Timeline</h2>
                    <p>
                        If your refund request is approved:
                    </p>
                    <ul>
                        <li><strong>Credit/Debit Card:</strong> Refunds will be processed to the original payment method within 7-10 business days. Please allow additional time for your bank to process the refund.</li>
                        <li><strong>UPI/Net Banking:</strong> Refunds will be credited within 5-7 business days.</li>
                        <li><strong>Wallet Payments:</strong> Refunds will be credited to your payment wallet within 3-5 business days.</li>
                    </ul>
                    <p>
                        <strong>Note:</strong> Chetna is not responsible for delays caused by your bank or payment provider.
                    </p>
                </section>

                <section>
                    <h2>6. Cancellations</h2>
                    <h3>6.1 Credit Purchases</h3>
                    <p>
                        Once a credit purchase is completed, it cannot be canceled. Credits are immediately added to your account and are non-refundable.
                    </p>

                    <h3>6.2 Subscription Plans (Future)</h3>
                    <p>
                        If we introduce subscription-based services in the future, cancellation terms will be provided at the time of purchase. Subscriptions may be canceled at any time, but no pro-rated refunds will be issued for partial billing periods unless required by law.
                    </p>
                </section>

                <section>
                    <h2>7. Chargeback Policy</h2>
                    <div className={styles.warningBox}>
                        <p>
                            <strong>Important:</strong> If you initiate a chargeback with your bank or credit card company without first contacting us, your account may be immediately suspended or terminated. Chargebacks are considered a breach of our Terms of Service.
                        </p>
                        <p>
                            We encourage you to reach out to our support team first to resolve any billing disputes amicably.
                        </p>
                    </div>
                </section>

                <section>
                    <h2>8. Exceptions and Special Circumstances</h2>
                    <p>
                        In rare cases, we may issue discretionary refunds or credits as a gesture of goodwill, even if the situation does not strictly meet our refund criteria. Such decisions are made on a case-by-case basis and do not set a precedent for future requests.
                    </p>
                </section>

                <section>
                    <h2>9. Legal Rights</h2>
                    <p>
                        This Refund Policy does not affect your statutory rights under applicable consumer protection laws. If you are located in a jurisdiction with mandatory consumer protection laws (e.g., India's Consumer Protection Act), you may be entitled to additional rights.
                    </p>
                </section>

                <section>
                    <h2>10. Changes to This Policy</h2>
                    <p>
                        We reserve the right to update this Refund Policy at any time. Changes will be posted on this page with an updated "Last Updated" date. Continued use of our services after changes constitutes acceptance of the updated policy.
                    </p>
                </section>

                <section>
                    <h2>11. Contact Us</h2>
                    <p>
                        For refund requests, billing inquiries, or questions about this policy, please contact:
                    </p>
                    <ul>
                        <li>Refunds: <a href="mailto:refunds@chetna.com">refunds@chetna.com</a></li>
                        <li>Support: <a href="mailto:support@chetna.com">support@chetna.com</a></li>
                    </ul>
                </section>

                <div className={styles.backLink}>
                    <Link href="/">← Back to Home</Link>
                </div>
            </div>
        </main>
    );
}
