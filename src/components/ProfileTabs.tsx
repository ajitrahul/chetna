'use client';

import { UserProfile } from '@/components/BirthDataForm';
import styles from './ProfileTabs.module.css';
import { Plus, Lock } from 'lucide-react';

interface ProfileTabsProps {
    profiles: UserProfile[];
    activeProfileId?: string;
    onSelectProfile: (id: string) => void;
    onAddProfile?: () => void;
    onUpgradeLimit?: () => void;
    canAddMore: boolean;
    currentCount: number;
    maxProfiles: number;
}

export default function ProfileTabs({
    profiles,
    activeProfileId,
    onSelectProfile,
    onAddProfile,
    onUpgradeLimit,
    canAddMore,
    currentCount,
    maxProfiles
}: ProfileTabsProps) {
    return (
        <div className={styles.tabsContainer}>
            <div className={styles.tabsScroller}>
                {profiles.map((profile) => {
                    const birthDate = new Date(profile.dateOfBirth);
                    const formattedDate = birthDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                    });

                    return (
                        <button
                            key={profile.id}
                            className={`${styles.tab} ${activeProfileId === profile.id ? styles.active : ''}`}
                            onClick={() => onSelectProfile(profile.id!)}
                        >
                            <span className={styles.tabName}>{profile.name}</span>
                            <span className={styles.tabDate}>{formattedDate}</span>
                        </button>
                    );
                })}

                {canAddMore && onAddProfile && (
                    <button
                        className={styles.addTab}
                        onClick={onAddProfile}
                        title="Add new profile"
                    >
                        <Plus size={20} />
                    </button>
                )}

                {!canAddMore && onUpgradeLimit && (
                    <button
                        className={styles.upgradeTab}
                        onClick={onUpgradeLimit}
                        title={`Profile limit reached (${currentCount}/${maxProfiles})`}
                    >
                        <Lock size={16} />
                        <span>Upgrade</span>
                    </button>
                )}
            </div>

            <div className={styles.tabsInfo}>
                <span className={styles.profileCount}>
                    {currentCount} / {maxProfiles} profiles
                </span>
            </div>
        </div>
    );
}
