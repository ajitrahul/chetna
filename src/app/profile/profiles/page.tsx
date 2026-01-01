'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, UserCircle, Trash2, Crown } from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';
import styles from './page.module.css';

interface UserProfile {
    id: string;
    name: string;
    dateOfBirth: string;
    isActive: boolean;
    disabledAt: string | null;
    disabledReason: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function AllProfilesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [profileToDelete, setProfileToDelete] = useState<string | string[] | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedProfiles, setSelectedProfiles] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/profile/profiles');
        }

        if (status === 'authenticated') {
            fetchProfiles();
        }
    }, [status, router]);

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/profiles');

            if (res.ok) {
                const data = await res.json();
                setProfiles(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleProfileSelection = (id: string) => {
        const newSelection = new Set(selectedProfiles);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedProfiles(newSelection);
    };

    const toggleSelectAllDisabled = () => {
        const disabledIds = profiles.filter(p => !p.isActive).map(p => p.id);
        if (selectedProfiles.size === disabledIds.length && disabledIds.every(id => selectedProfiles.has(id))) {
            setSelectedProfiles(new Set());
        } else {
            setSelectedProfiles(new Set(disabledIds));
        }
    };

    const handleDeleteClick = (profileId: string | string[]) => {
        setProfileToDelete(profileId);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!profileToDelete) return;

        try {
            setIsDeleting(true);
            const isBulk = Array.isArray(profileToDelete);

            const url = isBulk
                ? '/api/profiles/bulk-delete'
                : `/api/profiles/${profileToDelete}`;

            const options = isBulk
                ? {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: profileToDelete })
                }
                : { method: 'DELETE' };

            const res = await fetch(url, options);

            if (res.ok) {
                // Refresh data
                await fetchProfiles();
                setShowDeleteConfirm(false);
                setProfileToDelete(null);
                setSelectedProfiles(new Set());
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete profile(s)');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('An error occurred while deleting the profile(s)');
        } finally {
            setIsDeleting(false);
        }
    };

    if (status === 'loading' || (status === 'authenticated' && loading)) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
                <p>Loading your profiles...</p>
            </div>
        );
    }

    if (!session) return null;

    const activeProfiles = profiles.filter(p => p.isActive);
    const disabledProfiles = profiles.filter(p => !p.isActive);

    return (
        <div className={`container ${styles.pageContainer}`}>
            <div className={styles.header}>
                <Link href="/profile" className={styles.backLink}>
                    <ArrowLeft size={20} />
                    Back to Profile
                </Link>
                <h1 className={styles.title}>All Birth Chart Profiles</h1>
                <p className={styles.subtitle}>
                    {profiles.length} {profiles.length === 1 ? 'profile' : 'profiles'} total ({activeProfiles.length} active, {disabledProfiles.length} disabled)
                </p>
            </div>

            {activeProfiles.length > 0 && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <UserCircle size={20} />
                        Active Profile
                    </h2>
                    <div className={styles.profileList}>
                        {activeProfiles.map((profile) => (
                            <div key={profile.id} className={styles.profileCard}>
                                <div className={styles.profileInfo}>
                                    <div className={styles.nameRow}>
                                        <span className={styles.name}>{profile.name}</span>
                                        <span className={styles.activeBadge}>Active</span>
                                    </div>
                                    <span className={styles.details}>
                                        Born: {new Date(profile.dateOfBirth).toLocaleDateString()}
                                        {' • Created: '}{new Date(profile.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className={styles.actionsGroup}>
                                    <Link href={`/report/${profile.id}`} className={styles.reportBtn}>
                                        <Crown size={14} /> Life Report
                                    </Link>
                                    <Link href={`/chart?profileId=${profile.id}`} className={styles.viewBtn}>
                                        View Chart
                                        <ChevronRight size={18} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {disabledProfiles.length > 0 && (
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            Disabled Profiles ({disabledProfiles.length})
                        </h2>
                        <button
                            className={styles.selectAllBtn}
                            onClick={toggleSelectAllDisabled}
                        >
                            {selectedProfiles.size === disabledProfiles.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                    <div className={styles.profileList}>
                        {disabledProfiles.map((profile) => (
                            <div
                                key={profile.id}
                                className={`${styles.profileCard} ${styles.disabledCard} ${selectedProfiles.has(profile.id) ? styles.selectedCard : ''}`}
                                onClick={() => toggleProfileSelection(profile.id)}
                            >
                                <div className={styles.cardHeader}>
                                    <div className={styles.checkboxContainer}>
                                        <input
                                            type="checkbox"
                                            checked={selectedProfiles.has(profile.id)}
                                            onChange={() => { }} // Handled by card click
                                            className={styles.checkbox}
                                        />
                                    </div>
                                    <div className={styles.profileInfo}>
                                        <div className={styles.nameRow}>
                                            <span className={styles.name}>{profile.name}</span>
                                            <span className={styles.disabledBadge}>Disabled</span>
                                        </div>
                                        <span className={styles.details}>
                                            Born: {new Date(profile.dateOfBirth).toLocaleDateString()}
                                            {' • Created: '}{new Date(profile.createdAt).toLocaleDateString()}
                                            {profile.disabledAt && (
                                                <>
                                                    <br />
                                                    <span className={styles.disableDate}>
                                                        Disabled: {new Date(profile.disabledAt).toLocaleDateString()}
                                                    </span>
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.actionsGroup}>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteClick(profile.id);
                                        }}
                                        title="Delete Profile"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <div className={styles.disabledIcon}>
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {selectedProfiles.size > 0 && (
                <div className={styles.bulkActionBar}>
                    <div className={styles.selectionInfo}>
                        <span>{selectedProfiles.size} profile(s) selected</span>
                    </div>
                    <div className={styles.bulkActions}>
                        <button
                            className={styles.cancelBulkBtn}
                            onClick={() => setSelectedProfiles(new Set())}
                        >
                            Clear Selection
                        </button>
                        <button
                            className={styles.bulkDeleteBtn}
                            onClick={() => handleDeleteClick(Array.from(selectedProfiles))}
                        >
                            Delete Selected ({selectedProfiles.size})
                        </button>
                    </div>
                </div>
            )}

            {profiles.length === 0 && (
                <div className={styles.emptyState}>
                    <p>You haven't created any birth chart profiles yet.</p>
                    <Link href="/chart" className={styles.createLink}>
                        Create Your First Profile
                    </Link>
                </div>
            )}

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title={Array.isArray(profileToDelete) ? `Delete ${profileToDelete.length} Profiles?` : "Delete Profile?"}
                message={Array.isArray(profileToDelete)
                    ? `Are you sure you want to delete these ${profileToDelete.length} profiles? This action is permanent and cannot be undone.`
                    : "Are you sure you want to delete this profile? This action is permanent and cannot be undone."
                }
                confirmText={isDeleting ? "Deleting..." : "Yes, Delete"}
                cancelText="Cancel"
                onConfirm={handleConfirmDelete}
                onCancel={() => !isDeleting && setShowDeleteConfirm(false)}
                variant="danger"
            />
        </div>
    );
}
