'use client';

import { motion, AnimatePresence } from 'framer-motion';
import styles from './ProfileLimitModal.module.css';
import { X, CreditCard, Trash2, Crown } from 'lucide-react';

interface ProfileLimitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: () => void;
    onManageProfiles: () => void;
    currentCount: number;
    maxProfiles: number;
    expansionCost: number;
}

export default function ProfileLimitModal({
    isOpen,
    onClose,
    onUpgrade,
    onManageProfiles,
    currentCount,
    maxProfiles,
    expansionCost
}: ProfileLimitModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div
                        className={styles.modal}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20 }}
                    >
                        <button className={styles.closeBtn} onClick={onClose}>
                            <X size={20} />
                        </button>

                        <div className={styles.iconContainer}>
                            <Crown size={48} />
                        </div>

                        <h2 className={styles.title}>Profile Limit Reached</h2>
                        <p className={styles.subtitle}>
                            You have <strong>{currentCount} / {maxProfiles}</strong> active profiles
                        </p>

                        <div className={styles.options}>
                            {maxProfiles < 10 ? (
                                <button className={styles.optionCard} onClick={onUpgrade}>
                                    <div className={styles.optionIcon}>
                                        <CreditCard size={24} />
                                    </div>
                                    <div className={styles.optionText}>
                                        <h3>Expand Limit</h3>
                                        <p>Add 1 more profile slot</p>
                                        <span className={styles.cost}>{expansionCost} Credits</span>
                                    </div>
                                </button>
                            ) : (
                                <div className={`${styles.optionCard} ${styles.disabledOption}`}>
                                    <div className={styles.optionIcon} style={{ background: 'rgba(var(--foreground-rgb), 0.1)', color: 'var(--text-muted)' }}>
                                        <Crown size={24} />
                                    </div>
                                    <div className={styles.optionText}>
                                        <h3>Max Limit Reached</h3>
                                        <p>You have reached the maximum allowance of 10 profiles.</p>
                                    </div>
                                </div>
                            )}

                            <button className={styles.optionCard} onClick={onManageProfiles}>
                                <div className={styles.optionIcon} style={{ background: 'rgba(244, 67, 54, 0.1)', color: '#f44336' }}>
                                    <Trash2 size={24} />
                                </div>
                                <div className={styles.optionText}>
                                    <h3>Manage Profiles</h3>
                                    <p>Delete old profiles to free up space</p>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
