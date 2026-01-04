'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import { CreditCard, History, UserCircle, ChevronRight, MessageSquare, Trash2, Crown, Download, FileText, PlusCircle, Zap, Sparkles, MapPin, Clock, Trash, CheckSquare, Square, Info, Users } from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';

interface UserProfile {
    id: string;
    name: string;
    dateOfBirth: string;
    timeOfBirth: string;
    placeOfBirth: string;
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

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState({
        credits: 0,
        profilesCount: 0,
        questionsCount: 0
    });
    const [recentProfiles, setRecentProfiles] = useState<UserProfile[]>([]);
    const [recentQuestions, setRecentQuestions] = useState<UserQuestion[]>([]);
    const [recentExports, setRecentExports] = useState<any[]>([]);
    const [recentCredits, setRecentCredits] = useState<any[]>([]); // New state
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [activeSection, setActiveSection] = useState<'overview' | 'profiles' | 'history' | 'exports' | 'credits'>('overview');
    const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
    const [selectedExports, setSelectedExports] = useState<string[]>([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [isExportDeleting, setIsExportDeleting] = useState(false);

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
            const [creditsRes, profilesRes, questionsRes, exportsRes, creditHistoryRes] = await Promise.all([
                fetch('/api/credits/check'),
                fetch('/api/profiles'),
                fetch('/api/questions'),
                fetch('/api/user/exports'),
                fetch('/api/credits/history') // New fetch
            ]);

            const creditsData = await creditsRes.json();
            const profilesData = await profilesRes.ok ? await profilesRes.json() : [];
            const questionsData = await questionsRes.ok ? await questionsRes.json() : [];
            const exportsData = await exportsRes.ok ? await exportsRes.json() : [];
            const creditHistoryData = await creditHistoryRes.ok ? await creditHistoryRes.json() : [];

            setStats({
                credits: creditsData.totalCredits || 0,
                profilesCount: Array.isArray(profilesData) ? profilesData.length : 0,
                questionsCount: Array.isArray(questionsData) ? questionsData.length : 0
            });

            setRecentProfiles(Array.isArray(profilesData) ? profilesData.slice(0, 100) : []); // Increased slice for dashboard
            setRecentQuestions(Array.isArray(questionsData) ? questionsData.slice(0, 5) : []);
            setRecentExports(Array.isArray(exportsData) ? exportsData : []);
            setRecentCredits(Array.isArray(creditHistoryData) ? creditHistoryData : []);

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

    const handleBulkDelete = async () => {
        if (selectedProfiles.length === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedProfiles.length} profiles? Only inactive profiles can be deleted in bulk.`)) return;

        try {
            setIsBulkDeleting(true);
            const res = await fetch('/api/profiles/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedProfiles }),
            });

            if (res.ok) {
                await fetchProfileData();
                setSelectedProfiles([]);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete profiles');
            }
        } catch (error) {
            console.error('Bulk delete error:', error);
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const handleBulkDeleteExports = async () => {
        if (selectedExports.length === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedExports.length} export records?`)) return;

        try {
            setIsExportDeleting(true);
            const res = await fetch('/api/user/exports/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedExports }),
            });

            if (res.ok) {
                await fetchProfileData();
                setSelectedExports([]);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete export records');
            }
        } catch (error) {
            console.error('Bulk delete exports error:', error);
        } finally {
            setIsExportDeleting(false);
        }
    };

    const toggleProfileSelection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedProfiles(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const toggleExportSelection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedExports(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const selectAllProfiles = () => {
        if (selectedProfiles.length === recentProfiles.length) {
            setSelectedProfiles([]);
        } else {
            setSelectedProfiles(recentProfiles.map(p => p.id));
        }
    };

    const selectAllExports = () => {
        if (selectedExports.length === recentExports.length) {
            setSelectedExports([]);
        } else {
            setSelectedExports(recentExports.map(e => e.id));
        }
    };

    const handleDeleteExport = async (id: string) => {
        if (!confirm('Are you sure you want to delete this export record?')) return;

        try {
            const res = await fetch(`/api/user/exports/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchProfileData();
            } else {
                alert('Failed to delete export record');
            }
        } catch (error) {
            console.error('Delete export error:', error);
        }
    };

    const handleDeleteAllExports = async () => {
        if (recentExports.length === 0) return;
        if (!confirm('Are you sure you want to delete ALL chart export history? This action cannot be undone.')) return;

        try {
            const res = await fetch('/api/user/exports', { method: 'DELETE' });
            if (res.ok) {
                await fetchProfileData();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete all exports');
            }
        } catch (error) {
            console.error('Bulk delete exports error:', error);
        }
    };

    const handleDownloadPDF = async (exp: any) => {
        // Redirection logic to trigger download
        if (exp.url.startsWith('/api/charts/export')) {
            // It's a proper link
            window.open(exp.url, '_blank');
        } else {
            // Old record or placeholder
            alert('This report uses an older format and cannot be directly re-downloaded. Please generate a new one from the chart page.');
        }
    };

    if (status === 'loading' || (status === 'authenticated' && loading)) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
                <p>Aligning with your dashboard...</p>
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

            <div className={styles.layout}>
                {/* Sidebar Navigation */}
                <aside className={styles.sidebar}>
                    <nav className={styles.nav}>
                        <button
                            className={`${styles.navItem} ${activeSection === 'overview' ? styles.activeNav : ''}`}
                            onClick={() => setActiveSection('overview')}
                        >
                            <Crown size={18} /> Overview
                        </button>
                        <button
                            className={`${styles.navItem} ${activeSection === 'profiles' ? styles.activeNav : ''}`}
                            onClick={() => setActiveSection('profiles')}
                        >
                            <UserCircle size={18} /> Profiles
                        </button>
                        <button
                            className={`${styles.navItem} ${activeSection === 'credits' ? styles.activeNav : ''}`}
                            onClick={() => setActiveSection('credits')}
                        >
                            <CreditCard size={18} /> Credits
                        </button>
                        <button
                            className={`${styles.navItem} ${activeSection === 'history' ? styles.activeNav : ''}`}
                            onClick={() => setActiveSection('history')}
                        >
                            <MessageSquare size={18} /> Questions
                        </button>
                        <button
                            className={`${styles.navItem} ${activeSection === 'exports' ? styles.activeNav : ''}`}
                            onClick={() => setActiveSection('exports')}
                        >
                            <Download size={18} /> Chart Exports
                        </button>
                    </nav>
                </aside>

                <main className={styles.mainContent}>
                    {/* Overview Section */}
                    {activeSection === 'overview' && (
                        <div className={styles.overviewGrid}>
                            <section className={styles.heroSection}>
                                <h2>Welcome back, {session.user?.name?.split(' ')[0]}</h2>
                                <p>You have {stats.credits} clarity credits available. Need deeper insights?</p>
                                <div className={styles.heroActions}>
                                    <Link href="/clarity" className={styles.primaryBtn}>
                                        <Sparkles size={16} /> Ask AI Astrologer
                                    </Link>
                                    <Link href="/chart" className={styles.secondaryBtn}>
                                        <PlusCircle size={16} /> New Profile
                                    </Link>
                                </div>
                            </section>

                            <div className={styles.quickStats}>
                                <div className={styles.quickStatCard}>
                                    <h3>Recent Questions</h3>
                                    <div className={styles.miniList}>
                                        {recentQuestions.slice(0, 3).map(q => (
                                            <Link href={`/clarity/history/${q.id}`} key={q.id} className={styles.miniRow}>
                                                <span className={styles.miniText}>{q.questionText}</span>
                                                <ChevronRight size={14} />
                                            </Link>
                                        ))}
                                    </div>
                                    <button onClick={() => setActiveSection('history')} className={styles.textLink}>View All</button>
                                </div>
                                <div className={styles.quickStatCard}>
                                    <h3>Community</h3>
                                    <div className={styles.communityCTA}>
                                        <div className={styles.communityIcon}>
                                            <MessageSquare size={24} color="var(--accent-gold)" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-stone-600 mb-2">Connect with others, share reflections, and find collective awareness.</p>
                                            <Link href="/community" className={styles.miniLink}>
                                                Explore Forum →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Profiles Section */}
                    {activeSection === 'profiles' && (
                        <section className={styles.fullSection}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}><UserCircle size={20} /> My Birth Profiles</h2>
                                <div className={styles.headerActions}>
                                    {selectedProfiles.length > 0 && (
                                        <button
                                            className={styles.bulkDeleteBtn}
                                            onClick={handleBulkDelete}
                                            disabled={isBulkDeleting}
                                        >
                                            <Trash2 size={16} /> Delete Selected ({selectedProfiles.length})
                                        </button>
                                    )}
                                    <Link href="/chart" className={styles.actionBtn}>New Profile</Link>
                                </div>
                            </div>

                            {/* Life Report Action Card */}
                            {recentProfiles.find(p => p.isActive) && (
                                <div className={styles.lifeReportCard}>
                                    <div className={styles.lifeReportContent}>
                                        <div className={styles.lifeReportBadge}><Crown size={14} /> Premium Life Feature</div>
                                        <h3>Your Grand Life Report</h3>
                                        <p>Get a comprehensive 40-page analysis of your destiny, health, and soul purpose based on {recentProfiles.find(p => p.isActive)?.name}&apos;s chart.</p>
                                        <Link href={`/report/${recentProfiles.find(p => p.isActive)?.id}`} className={styles.reportBtn}>
                                            Access Life Report <PlusCircle size={16} />
                                        </Link>
                                    </div>
                                    <div className={styles.lifeReportIcon}>
                                        <Crown size={80} />
                                    </div>
                                </div>
                            )}

                            <div className={styles.profileControls}>
                                <button className={styles.textLink} onClick={selectAllProfiles}>
                                    {selectedProfiles.length === recentProfiles.length ? 'Deselect All' : 'Select All'}
                                </button>
                                <span className={styles.profileCount}>{recentProfiles.length} Profiles Saved</span>
                            </div>

                            <div className={styles.profileGrid}>
                                {recentProfiles.length > 0 ? (
                                    recentProfiles.map((profile) => (
                                        <div
                                            key={profile.id}
                                            className={`${styles.profileCard} ${!profile.isActive ? styles.disabledCard : ''} ${selectedProfiles.includes(profile.id) ? styles.selectedCard : ''}`}
                                            onClick={() => router.push(`/chart?profileId=${profile.id}`)}
                                        >
                                            <div className={styles.cardHeader}>
                                                <button
                                                    className={styles.checkbox}
                                                    onClick={(e) => toggleProfileSelection(profile.id, e)}
                                                >
                                                    {selectedProfiles.includes(profile.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                                                </button>
                                                {profile.isActive ? (
                                                    <span className={styles.activeBadge}>Active</span>
                                                ) : (
                                                    <span className={styles.disabledBadge}>Disabled</span>
                                                )}
                                            </div>

                                            <div className={styles.cardBody}>
                                                <h3 className={styles.profileName}>{profile.name}</h3>
                                                <div className={styles.detailList}>
                                                    <div className={styles.detailItem}>
                                                        <Clock size={14} />
                                                        <span>
                                                            {new Date(profile.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                            <span className={styles.timeLabel}> at {profile.timeOfBirth}</span>
                                                        </span>
                                                    </div>
                                                    <div className={styles.detailItem}>
                                                        <MapPin size={14} />
                                                        <span>{profile.placeOfBirth}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={styles.cardActions}>
                                                <Link href={`/chart?profileId=${profile.id}`} className={styles.viewLink} onClick={(e) => e.stopPropagation()}>
                                                    View Chart <ChevronRight size={16} />
                                                </Link>
                                                {!profile.isActive && (
                                                    <button
                                                        className={styles.iconDeleteBtn}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteClick(profile.id);
                                                        }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
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
                            </div>
                        </section>
                    )}

                    {/* Credits Section */}
                    {activeSection === 'credits' && (
                        <section className={styles.fullSection}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}><CreditCard size={20} /> Clarity Credits</h2>
                                <Link href="/pricing" className={styles.actionBtn}>Add Credits</Link>
                            </div>
                            <div className={styles.creditsDisplay}>
                                <div className={styles.creditValueLarge}>
                                    <Zap size={32} />
                                    <span>{stats.credits}</span>
                                    <label>Available Credits</label>
                                </div>
                                <div className={styles.tableWrapper}>
                                    {recentCredits.length > 0 ? (
                                        <table className={styles.exportTable}>
                                            <thead>
                                                <tr>
                                                    <th>Description</th>
                                                    <th>Date</th>
                                                    <th>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentCredits.map((tx) => (
                                                    <tr key={tx.id}>
                                                        <td>
                                                            <div className={styles.exportTypeCell}>
                                                                <div
                                                                    className={styles.miniIcon}
                                                                    style={{
                                                                        background: tx.amount > 0 ? 'rgba(75, 181, 67, 0.1)' : 'rgba(255, 71, 71, 0.1)',
                                                                        color: tx.amount > 0 ? '#4bb543' : '#ff4747'
                                                                    }}
                                                                >
                                                                    {tx.amount > 0 ? <PlusCircle size={14} /> : <Zap size={14} />}
                                                                </div>
                                                                <span>{tx.description}</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className={styles.dateCell}>
                                                                {new Date(tx.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span
                                                                className={styles.amountCell}
                                                                style={{ color: tx.amount > 0 ? '#4bb543' : '#ff4747' }}
                                                            >
                                                                {tx.amount > 0 ? '+' : ''}{tx.amount}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className={styles.emptyState}>
                                            <p>No credit history yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* History Section */}
                    {activeSection === 'history' && (
                        <section className={styles.fullSection}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}><MessageSquare size={20} /> Question History</h2>
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
                                                <p className={styles.historyDate}>{new Date(q.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <Link href={`/clarity/history/${q.id}`} className={styles.viewResultBtn}>
                                                View Solution
                                            </Link>
                                        </div>
                                    ))
                                ) : <div className={styles.emptyState}><p>No questions asked yet.</p></div>}
                            </div>
                        </section>
                    )}

                    {/* Exports Section */}
                    {activeSection === 'exports' && (
                        <section className={styles.fullSection}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}><Download size={20} /> Chart Exports History</h2>
                                <div className={styles.headerActions}>
                                    {selectedExports.length > 0 && (
                                        <button
                                            className={styles.bulkDeleteBtn}
                                            onClick={handleBulkDeleteExports}
                                            disabled={isExportDeleting}
                                        >
                                            <Trash2 size={16} /> Delete Selected ({selectedExports.length})
                                        </button>
                                    )}
                                    <button
                                        className={styles.actionBtnSecondary}
                                        onClick={handleDeleteAllExports}
                                    >
                                        <Trash size={16} /> Delete All
                                    </button>
                                </div>
                            </div>
                            <div className={styles.tableWrapper}>
                                {recentExports.length > 0 ? (
                                    <table className={styles.exportTable}>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '40px' }}>
                                                    <button
                                                        className={styles.checkbox}
                                                        onClick={selectAllExports}
                                                        title={selectedExports.length === recentExports.length ? "Deselect All" : "Select All"}
                                                    >
                                                        {selectedExports.length === recentExports.length && recentExports.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                                                    </button>
                                                </th>
                                                <th>Report Type</th>
                                                <th>Export Date & Time</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentExports.map((exp: any) => (
                                                <tr
                                                    key={exp.id}
                                                    className={selectedExports.includes(exp.id) ? styles.selectedRow : ''}
                                                    onClick={(e) => toggleExportSelection(exp.id, e as any)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <td onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            className={styles.checkbox}
                                                            onClick={(e) => toggleExportSelection(exp.id, e as any)}
                                                        >
                                                            {selectedExports.includes(exp.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <div className={styles.exportTypeCell}>
                                                            <FileText size={16} />
                                                            <span>{exp.chartType} Analysis</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={styles.dateCell}>
                                                            {new Date(exp.createdAt).toLocaleDateString()}
                                                            <small className={styles.timeLabel}> at {new Date(exp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                                                        </span>
                                                    </td>
                                                    <td onClick={(e) => e.stopPropagation()}>
                                                        <div className={styles.actionCell}>
                                                            <button className={styles.miniDownloadBtn} onClick={() => handleDownloadPDF(exp)}>
                                                                Download PDF
                                                            </button>
                                                            <button className={styles.miniTrashBtn} onClick={() => handleDeleteExport(exp.id)} title="Delete entry">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className={styles.emptyState}>
                                        <p>No exported files.</p>
                                    </div>
                                )}
                            </div>
                            <div className={styles.infoNote}>
                                <Info size={14} />
                                <span>Export records are kept for the duration of your session. Re-downloading re-generates the report with current planetary data.</span>
                            </div>
                        </section>
                    )}
                </main>
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
