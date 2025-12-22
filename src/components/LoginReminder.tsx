'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { LogIn, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './LoginReminder.module.css';

export default function LoginReminder() {
    const { status } = useSession();
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only show if unauthenticated, not on login page, 
        // and hasn't been dismissed in this session
        const isDismissed = sessionStorage.getItem('login-reminder-dismissed');

        if (status === 'unauthenticated' && pathname !== '/login' && !isDismissed) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 3000); // Show after 3 seconds
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [status, pathname]);

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('login-reminder-dismissed', 'true');
    };

    const handleLogin = () => {
        window.location.href = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    className={styles.reminder}
                >
                    <button className={styles.closeBtn} onClick={handleDismiss}>
                        <X size={16} />
                    </button>

                    <div className={styles.content}>
                        <div className={styles.iconWrapper}>
                            <Sparkles size={20} />
                        </div>
                        <div className={styles.textGroup}>
                            <h4 className={styles.title}>Unlock Full Awareness</h4>
                            <p className={styles.text}>Save your chart, track your timing, and keep a reflective journal.</p>
                        </div>
                    </div>

                    <button className={styles.loginBtn} onClick={handleLogin}>
                        <LogIn size={18} />
                        Sign In Now
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
