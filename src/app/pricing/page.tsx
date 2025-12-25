'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';


declare global {
    interface Window {
        Razorpay: {
            new(options: Record<string, unknown>): {
                open: () => void;
            };
        };
    }
}

export default function PricingPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);

    const handlePurchase = async (amount: number, productType: string, productName: string) => {
        if (!session) {
            router.push('/login?callbackUrl=/pricing');
            return;
        }

        setLoading(productType);

        try {
            // Create order
            const response = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, productType, productName }),
            });

            const order = await response.json();

            if (!response.ok) {
                throw new Error(order.error || 'Failed to create order');
            }

            // Initialize Razorpay checkout
            const options = {
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: 'Chetna',
                description: productName,
                order_id: order.orderId,
                handler: function () {
                    alert('Payment successful! Credits added to your account.');
                    router.push('/clarity');
                },
                prefill: {
                    email: session.user?.email || '',
                    name: session.user?.name || '',
                },
                theme: {
                    color: '#D4AF37',
                },
                modal: {
                    ondismiss: function () {
                        setLoading(null);
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed. Please try again.');
        } finally {
            setLoading(null);
        }
    };

    return (
        <>
            {/* Load Razorpay script */}
            <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>

            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Pricing</h1>
                    <p className={styles.subtitle}>
                        Chetna follows a simple and transparent pricing model. You pay only for what you choose to explore — no subscriptions, no pressure.
                    </p>
                </div>

                <div className={styles.pricingGrid}>
                    {/* Single Question */}
                    <div className={styles.priceCard}>
                        <div className={styles.cardLabel}>Single Question</div>
                        <div className={styles.price}>₹149</div>
                        <div className={styles.priceUnit}>per question</div>
                        <ul className={styles.features}>
                            <li>One focused question at a time</li>
                            <li>Chart-aware, pattern-based guidance</li>
                            <li>No predictions or guarantees</li>
                            <li>Designed for reflection and clarity</li>
                        </ul>
                        <button
                            onClick={() => handlePurchase(149, 'SINGLE_QUESTION', 'Single Clarity Question')}
                            className={styles.ctaBtn}
                            disabled={loading === 'SINGLE_QUESTION'}
                        >
                            {loading === 'SINGLE_QUESTION' ? 'Processing...' : 'Ask Now'}
                        </button>
                    </div>

                    {/* 5 Questions Pack */}
                    <div className={`${styles.priceCard} ${styles.featured}`}>
                        <div className={styles.cardLabel}>Credit Pack</div>
                        <div className={styles.price}>₹699</div>
                        <div className={styles.priceUnit}>5 questions</div>
                        <ul className={styles.features}>
                            <li>Use at your own pace</li>
                            <li>No expiry date</li>
                            <li>No auto-renewal</li>
                            <li>Save ₹46 per question</li>
                        </ul>
                        <button
                            onClick={() => handlePurchase(699, 'CREDIT_PACK_5', '5 Question Credit Pack')}
                            className={styles.ctaBtn}
                            disabled={loading === 'CREDIT_PACK_5'}
                        >
                            {loading === 'CREDIT_PACK_5' ? 'Processing...' : 'Get Credits'}
                        </button>
                    </div>

                    {/* 10 Questions Pack */}
                    <div className={styles.priceCard}>
                        <div className={styles.cardLabel}>Credit Pack</div>
                        <div className={styles.price}>₹1299</div>
                        <div className={styles.priceUnit}>10 questions</div>
                        <ul className={styles.features}>
                            <li>Use at your own pace</li>
                            <li>No expiry date</li>
                            <li>No auto-renewal</li>
                            <li>Save ₹191 total</li>
                        </ul>
                        <button
                            onClick={() => handlePurchase(1299, 'CREDIT_PACK_10', '10 Question Credit Pack')}
                            className={styles.ctaBtn}
                            disabled={loading === 'CREDIT_PACK_10'}
                        >
                            {loading === 'CREDIT_PACK_10' ? 'Processing...' : 'Get Credits'}
                        </button>
                    </div>
                </div>

                <div className={styles.infoSection}>
                    <h2>What You&apos;re Paying For</h2>
                    <ul>
                        <li>Structured astrological interpretation</li>
                        <li>AI-assisted reflection and guidance</li>
                        <li>Ethical safeguards and clarity-first design</li>
                        <li>Pattern-based insights aligned with your chart</li>
                    </ul>
                </div>

                <div className={styles.infoSection}>
                    <h2>You Are NOT Paying For</h2>
                    <ul>
                        <li>Fortune-telling or predictions</li>
                        <li>Emergency answers or urgent decisions</li>
                        <li>Absolute certainties or guarantees</li>
                        <li>Dependency-creating models</li>
                    </ul>
                </div>

                <div className={styles.noteBox}>
                    <p>
                        <strong>A Gentle Reminder:</strong> Chetna encourages thoughtful use. More questions do not mean better answers — clarity comes from reflection and action.
                    </p>
                </div>
            </div>
        </>
    );
}
