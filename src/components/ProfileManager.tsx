'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import styles from './ProfileManager.module.css';

export type UserProfile = {
    id: string;
    name: string;
    dob: string;
    tob: string;
    pob: string;
};

interface ProfileManagerProps {
    onSelectProfile: (profile: UserProfile) => void;
}

export default function ProfileManager({ onSelectProfile }: ProfileManagerProps) {
    const [profiles, setProfiles] = useLocalStorage<UserProfile[]>('chetna_profiles', []);
    const [isOpen, setIsOpen] = useState(false);

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Remove this profile from your circle?')) {
            setProfiles(profiles.filter(p => p.id !== id));
        }
    };

    if (profiles.length === 0) return null;

    return (
        <div className={styles.container}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={styles.toggleBtn}
            >
                Load Saved Profile ({profiles.length})
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <h4 className={styles.title}>Your Circle</h4>
                    <ul className={styles.list}>
                        {profiles.map(profile => (
                            <li key={profile.id} className={styles.item} onClick={() => {
                                onSelectProfile(profile);
                                setIsOpen(false);
                            }}>
                                <div className={styles.info}>
                                    <span className={styles.name}>{profile.name}</span>
                                    <span className={styles.date}>{profile.dob}</span>
                                </div>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={(e) => handleDelete(e, profile.id)}
                                >
                                    &times;
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
