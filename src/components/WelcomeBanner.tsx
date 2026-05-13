'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function WelcomeBanner({ bonusAmount = 10 }: { bonusAmount?: number }) {
    const { status } = useSession();
    const [isVisible, setIsVisible] = useState(true);
    const [resolvedBonusAmount, setResolvedBonusAmount] = useState<number | null>(null);

    useEffect(() => {
        if (status === 'authenticated') {
            return;
        }

        let isMounted = true;

        const loadWelcomeBonusAmount = async () => {
            try {
                const response = await fetch('/api/public/welcome-bonus', {
                    method: 'GET',
                    cache: 'no-store'
                });

                if (!response.ok) {
                    if (isMounted) {
                        setResolvedBonusAmount(bonusAmount);
                    }
                    return;
                }

                const data = await response.json();
                if (isMounted && typeof data?.bonusAmount === 'number' && Number.isFinite(data.bonusAmount)) {
                    setResolvedBonusAmount(data.bonusAmount);
                    return;
                }

                if (isMounted) {
                    setResolvedBonusAmount(bonusAmount);
                }
            } catch (error) {
                if (isMounted) {
                    setResolvedBonusAmount(bonusAmount);
                }
                console.error('Failed to load welcome bonus amount:', error);
            }
        };

        void loadWelcomeBonusAmount();

        return () => {
            isMounted = false;
        };
    }, [bonusAmount, status]);

    if (status === 'authenticated' || !isVisible) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{
                    width: '100%',
                    background: 'linear-gradient(to right, var(--bg-primary), var(--bg-secondary))',
                    borderBottom: '1px solid var(--accent-gold)',
                    position: 'relative',
                    zIndex: 50
                }}
            >
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '12px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    flexWrap: 'wrap'
                }}>
                    <Sparkles size={18} color="var(--accent-gold)" />
                    <span style={{
                        color: 'var(--foreground)',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        textAlign: 'center'
                    }}>
                        Unlock your spiritual journey!
                        <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold', marginLeft: '6px' }}>
                            {resolvedBonusAmount === null
                                ? 'Sign up now to get free credits.'
                                : `Sign up now to get ${resolvedBonusAmount} free credits.`}
                        </span>
                    </span>
                    <Link
                        href="/login"
                        style={{
                            background: 'var(--accent-gold)',
                            color: '#000',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Claim Credits
                    </Link>

                    <button
                        onClick={() => setIsVisible(false)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px',
                            position: 'absolute',
                            right: '16px'
                        }}
                        aria-label="Close banner"
                    >
                        <X size={16} />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
