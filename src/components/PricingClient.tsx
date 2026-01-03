
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import styles from '@/app/pricing/page.module.css'; // Assuming shared styles or move to component specific

declare global {
    interface Window {
        Razorpay: {
            new(options: Record<string, unknown>): {
                open: () => void;
            };
        };
    }
}

interface PricingPlan {
    key: string;
    name: string;
    description: string | null;
    price: number; // in paise
    currency: string;
    credits: number;
}

interface PricingClientProps {
    plans: PricingPlan[];
}

export default function PricingClient({ plans }: PricingClientProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);

    const handlePurchase = async (plan: PricingPlan) => {
        if (!session) {
            router.push('/login?callbackUrl=/pricing');
            return;
        }

        setLoading(plan.key);

        try {
            // Create order
            const response = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productKey: plan.key,
                    productName: plan.name
                }),
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
                description: plan.name,
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

    // Sort plans: Single Question first, then Packs by price
    const sortedPlans = [...plans].sort((a, b) => a.price - b.price);

    return (
        <>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Pricing</h1>
                    <p className={styles.subtitle}>
                        Chetna follows a simple and transparent pricing model. You pay only for what you choose to explore — no subscriptions, no pressure.
                    </p>
                </div>

                <div className={styles.pricingGrid}>
                    {sortedPlans.map((plan) => {
                        const isFeatured = plan.credits === 5; // Highlight 5-pack as featured if desired
                        return (
                            <div key={plan.key} className={`${styles.priceCard} ${isFeatured ? styles.featured : ''}`}>
                                <div className={styles.cardLabel}>{plan.credits === 1 ? 'Single Question' : 'Credit Pack'}</div>
                                <div className={styles.price}>₹{plan.price / 100}</div>
                                <div className={styles.priceUnit}>
                                    {plan.credits === 1 ? 'per question' : `${plan.credits} questions`}
                                </div>
                                <ul className={styles.features}>
                                    {plan.description && <li>{plan.description}</li>}
                                    {plan.credits > 1 ? (
                                        <>
                                            <li>Use at your own pace</li>
                                            <li>No expiry date</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>Chart-aware guidance</li>
                                            <li>No predictions</li>
                                        </>
                                    )}
                                </ul>
                                <button
                                    onClick={() => handlePurchase(plan)}
                                    className={styles.ctaBtn}
                                    disabled={loading === plan.key}
                                >
                                    {loading === plan.key ? 'Processing...' : (plan.credits > 1 ? 'Get Credits' : 'Ask Now')}
                                </button>
                            </div>
                        );
                    })}
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
