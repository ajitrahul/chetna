'use client';

import { motion, AnimatePresence } from 'framer-motion';
import BirthDataForm from './BirthDataForm';
import styles from './ProfileDrawer.module.css';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ProfileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (data: any) => void;
}

export default function ProfileDrawer({ isOpen, onClose, onSuccess }: ProfileDrawerProps) {
    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleSuccess = (profileData: any) => {
        if (onSuccess) {
            onSuccess(profileData);
        }
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.div
                        className={styles.drawer}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        <div className={styles.drawerHeader}>
                            <h2 className={styles.drawerTitle}>Create New Profile</h2>
                            <button
                                className={styles.closeButton}
                                onClick={onClose}
                                aria-label="Close drawer"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className={styles.drawerContent}>
                            <BirthDataForm onChartGenerated={handleSuccess} />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
