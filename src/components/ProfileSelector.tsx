'use client';

import { useProfile } from '@/context/ProfileContext';
import { UserProfile } from './BirthDataForm';
import { PlusCircle, User } from 'lucide-react';
import styles from './ProfileSelector.module.css';

interface ProfileSelectorProps {
    onSelect: (profile: UserProfile) => void;
}

export default function ProfileSelector({ onSelect }: ProfileSelectorProps) {
    const { profileData, openNewProfileModal, loading } = useProfile();

    if (loading && !profileData) {
        return <div className={styles.loading}>Loading profiles...</div>;
    }

    const profiles = profileData?.profiles || [];

    return (
        <div className={styles.container}>
            <div className={styles.list}>
                {profiles.map((profile: any) => (
                    <button
                        key={profile.id}
                        onClick={() => onSelect(profile)}
                        className={styles.profileBtn}
                    >
                        <User size={16} />
                        <span>{profile.name}</span>
                    </button>
                ))}
            </div>

            <button onClick={openNewProfileModal} className={styles.newBtn}>
                <PlusCircle size={16} />
                <span>Create New Profile</span>
            </button>
        </div>
    );
}
