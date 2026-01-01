'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import { CreditCard, History, UserCircle, ChevronRight, MessageSquare, Trash2, Crown } from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';

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

interface UserQuestion {
    id: string;
    questionText: string;
    createdAt: string;
}

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState({
        credits: 0,
        profilesCount: 0,
        questionsCount: 0
    });
    const [recentProfiles, setRecentProfiles] = useState<UserProfile[]>([]);
    const [recentQuestions, setRecentQuestions] = useState<UserQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/profile');
        }

        if (status === 'authenticated') {
            fetchProfileData();
        }
    }, [status, router]);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            // In a real app, these would be separate or combined API calls
            const [creditsRes, profilesRes, questionsRes] = await Promise.all([
                fetch('/api/credits/check'),
                fetch('/api/profiles'), // We'll need to create this
                fetch('/api/questions') // We'll need to create this
            ]);

            const creditsData = await creditsRes.json();
            const profilesData = await profilesRes.ok ? await profilesRes.json() : [];
            const questionsData = await questionsRes.ok ? await questionsRes.json() : [];

            setStats({
                credits: creditsData.totalCredits || 0,
                profilesCount: Array.isArray(profilesData) ? profilesData.length : 0,
                questionsCount: Array.isArray(questionsData) ? questionsData.length : 0
            });

            setRecentProfiles(Array.isArray(profilesData) ? profilesData.slice(0, 3) : []);
            setRecentQuestions(Array.isArray(questionsData) ? questionsData.slice(0, 5) : []);

        } catch (error) {
            console.error('Failed to fetch profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (profileId: string) => {
        setProfileToDelete(profileId);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!profileToDelete) return;

        try {
            setIsDeleting(true);
            const res = await fetch(`/api/profiles/${profileToDelete}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                // Refresh data
                await fetchProfileData();
                setShowDeleteConfirm(false);
                setProfileToDelete(null);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete profile');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('An error occurred while deleting the profile');
        } finally {
            setIsDeleting(false);
        }
    };

    if (status === 'loading' || (status === 'authenticated' && loading)) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
                <p>Aligning with your profile...</p>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className={`container ${styles.profileContainer}`}>
            <header className={styles.header}>
                <div className={styles.userBasicInfo}>
                    <div className={styles.avatar}>
                        {session.user?.image ? (
                            <Image src={session.user.image} alt={session.user.name || 'User'} width={64} height={64} className={styles.avatarImage} />
                        ) : (
                            <UserCircle size={64} />
                        )}
                    </div>
                    <div>
                        <h1 className={styles.userName}>{session.user?.name}</h1>
                        <p className={styles.userEmail}>{session.user?.email}</p>
                    </div>
                </div>
                <div className={styles.statsBar}>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{stats.credits}</span>
                        <span className={styles.statLabel}>Credits</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{stats.profilesCount}</span>
                        <span className={styles.statLabel}>Profiles</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{stats.questionsCount}</span>
                        <span className={styles.statLabel}>Questions</span>
                    </div>
                </div>
            </header>

            <div className={styles.grid}>
                {/* Credits Section */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            <CreditCard size={20} /> Your Credits
                        </h2>
                        <Link href="/pricing" className={styles.actionLink}>Buy More</Link>
                    </div>
                    <div className={styles.creditsCard}>
                        <p>You have <strong>{stats.credits}</strong> clarity credits available.</p>
                        <p className={styles.creditsNote}>Use them to ask focused questions about your chart patterns.</p>
                        <Link href="/clarity" className={styles.primaryBtn}>Ask a Question</Link>
                    </div>
                </section>

                {/* Profiles Section */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            <UserCircle size={20} /> Saved Profiles
                        </h2>
                        <Link href="/chart" className={styles.actionLink}>Add New</Link>
                    </div>
                    <div className={styles.list}>
                        {recentProfiles.length > 0 ? (
                            recentProfiles.map((profile) => (
                                <div key={profile.id} className={`${styles.listItem} ${!profile.isActive ? styles.disabledListItem : ''}`}>
                                    <div className={styles.profileInfo}>
                                        <div className={styles.nameRow}>
                                            <span className={styles.name}>{profile.name}</span>
                                            {profile.isActive ? (
                                                <span className={styles.activeBadge}>Active</span>
                                            ) : (
                                                <span className={styles.disabledBadge}>Disabled</span>
                                            )}
                                        </div>
                                        <span className={styles.details}>
                                            {new Date(profile.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className={styles.actionsGroup}>
                                        {!profile.isActive && (
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => handleDeleteClick(profile.id)}
                                                title="Delete Profile"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                        {profile.isActive ? (
                                            <div className={styles.profileActions}>
                                                <Link href={`/report/${profile.id}`} className={styles.reportTagBtn}>
                                                    <Crown size={12} /> Life Report
                                                </Link>
                                                <Link href={`/chart?profileId=${profile.id}`} className={styles.profileLink}>
                                                    View Chart <ChevronRight size={16} />
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className={styles.iconLinkDisabled}>
                                                <ChevronRight size={18} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <p>No saved profiles yet.</p>
                                <Link href="/chart" className={styles.textLink}>Create your birth chart</Link>
                            </div>
                        )}
                        {stats.profilesCount > 3 && (
                            <Link href="/profile/profiles" className={styles.viewMore}>View all profiles</Link>
                        )}
                    </div>
                </section>

                {/* History Section */}
                <section className={`${styles.section} ${styles.fullWidth}`}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            <History size={20} /> Recent Questions
                        </h2>
                    </div>
                    <div className={styles.list}>
                        {recentQuestions.length > 0 ? (
                            recentQuestions.map((q) => (
                                <div key={q.id} className={styles.historyItem}>
                                    <div className={styles.historyIcon}>
                                        <MessageSquare size={18} />
                                    </div>
                                    <div className={styles.historyContent}>
                                        <p className={styles.historyQuestion}>{q.questionText}</p>
                                        <p className={styles.historyDate}>{new Date(q.createdAt).toLocaleDateString()} at {new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <Link href={`/clarity/history/${q.id}`} className={styles.viewResultBtn}>
                                        View Insights
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <p>You haven&apos;t asked any clarity questions yet.</p>
                                <Link href="/clarity" className={styles.textLink}>Seek your first insight</Link>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Profile?"
                message="Are you sure you want to delete this profile? This action is permanent and cannot be undone."
                confirmText={isDeleting ? "Deleting..." : "Yes, Delete"}
                cancelText="Cancel"
                onConfirm={handleConfirmDelete}
                onCancel={() => !isDeleting && setShowDeleteConfirm(false)}
                variant="danger"
            />
        </div>
    );
}
