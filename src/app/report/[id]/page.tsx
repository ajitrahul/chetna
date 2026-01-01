'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Lock,
    Sparkles,
    FileText,
    Download,
    Crown,
    ChevronRight,
    ShieldCheck,
    Zap,
    Star,
    Compass
} from 'lucide-react';
import styles from './page.module.css';
import ChartDisplay from '@/components/ChartDisplay';
import ProfileGuard from '@/components/ProfileGuard';

interface ReportPageProps {
    params: Promise<{ id: string }>;
}

function ReportContent({ params }: ReportPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [report, setReport] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/reports/${id}`);
                if (!res.ok) throw new Error('Failed to load report data');
                const data = await res.json();
                setProfile(data.profile);
                setReport(data.report);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handlePurchase = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/reports/${id}/purchase`, { method: 'POST' });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || data.error || 'Purchase failed');

            alert('Congratulations! Your premium report is now unlocked.');
            window.location.reload();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/reports/${id}/generate`, { method: 'POST' });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Generation failed');

            setReport({ ...report, status: 'generated', content: data.content });
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !profile) return <div className={styles.loading}>Retrieving cosmic data...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    const isPurchased = report?.status === 'purchased' || report?.status === 'generated';

    return (
        <div className={styles.reportPage}>
            <header className={styles.header}>
                <Link href="/profile" className={styles.backLink}>
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </Link>
                <div className={styles.meta}>
                    <Crown size={20} className={styles.premiumIcon} />
                    <span className={styles.tagline}>Premium Life Guidance</span>
                </div>
            </header>

            <main className={styles.main}>
                {/* Cover Section */}
                <section className={styles.cover}>
                    <div className={styles.orb}></div>
                    <h1 className={styles.title}>The Life Guidance Report</h1>
                    <p className={styles.subtitle}>Prepared exclusively for <strong>{profile.name}</strong></p>
                    <div className={styles.divider}></div>
                </section>

                {/* Free Preview / High-Level Charts */}
                <section className={styles.vargasGrid}>
                    <div className={styles.vargaCard}>
                        <h3>D1: The Physical Self</h3>
                        <div className={styles.chartWrapper}>
                            <ChartDisplay data={profile.chartData} />
                        </div>
                        <p className={styles.vargaDesc}>Your baseline personality and physical journey.</p>
                    </div>

                    <div className={styles.vargaCard}>
                        <h3>D9: The Soul Journey</h3>
                        <div className={styles.chartWrapper}>
                            {/* Transform array-based varga data to record-based for ChartDisplay */}
                            <ChartDisplay data={{
                                planets: Object.fromEntries(profile.chartData?.vargas?.d9?.planets?.map((p: any) => [p.name, p]) || []),
                                houses: profile.chartData?.houses,
                                ascendant: profile.chartData?.vargas?.d9?.ascendant?.longitude,
                                navamsaAscendant: profile.chartData?.vargas?.d9?.ascendant?.rasi?.toString()
                            }} />
                        </div>
                        <p className={styles.vargaDesc}>Your inner strength and marital destiny.</p>
                    </div>

                    <div className={styles.vargaCard}>
                        <h3>D10: Career & Status</h3>
                        <div className={styles.chartWrapper}>
                            <ChartDisplay data={{
                                planets: Object.fromEntries(profile.chartData?.vargas?.d10?.planets?.map((p: any) => [p.name, p]) || []),
                                houses: profile.chartData?.houses,
                                ascendant: profile.chartData?.vargas?.d10?.ascendant?.longitude,
                                navamsaAscendant: profile.chartData?.vargas?.d10?.ascendant?.rasi?.toString()
                            }} />
                        </div>
                        <p className={styles.vargaDesc}>Professional growth and public recognition.</p>
                    </div>
                </section>

                {/* Purchase CTA / Full Report Content */}
                {!isPurchased ? (
                    <section className={styles.paywall}>
                        <div className={styles.lockIcon}>
                            <Lock size={48} />
                        </div>
                        <h2>Unveil Your Full Cosmic Blueprint</h2>
                        <p>
                            Your surface chart is just the beginning. The full 18-page report delves deep into
                            your soul's purpose, career pitfalls, and relationship karma.
                        </p>

                        <div className={styles.featureList}>
                            <div className={styles.featureItem}>
                                <Sparkles size={18} />
                                <span>Deep analysis of D9 (Navmansha) & D10 (Dashmansha)</span>
                            </div>
                            <div className={styles.featureItem}>
                                <ShieldCheck size={18} />
                                <span>Karmic lessons and conscious remedies</span>
                            </div>
                            <div className={styles.featureItem}>
                                <FileText size={18} />
                                <span>Lifetime access with downloadable PDF</span>
                            </div>
                        </div>

                        <button className={styles.purchaseBtn} onClick={handlePurchase} disabled={loading}>
                            <Crown size={20} />
                            {loading ? 'Processing...' : 'Unlock Full Report (99 Credits)'}
                        </button>
                        <p className={styles.refundNote}>Valid for Life • Secure Cosmic Insights</p>
                    </section>
                ) : (
                    <section className={styles.reportContent}>
                        {/* This will render the AI generated content */}
                        <div className={styles.generationStatus}>
                            {report.status === 'purchased' ? (
                                <div className={styles.startGen}>
                                    <Zap size={32} className={styles.zap} />
                                    <h3>Insight Ready to Be Woven</h3>
                                    <p>Our AI is ready to synthesize your charts into a personalized narrative.</p>
                                    <button className={styles.generateBtn} onClick={handleGenerate} disabled={loading}>
                                        {loading ? 'Synthesizing...' : 'Generate Full Insight'}
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.fullReport}>
                                    {/* Request Information Line Item */}
                                    <div className={styles.statusLine}>
                                        <div className={styles.statusInfo}>
                                            <FileText size={20} className={styles.statusIcon} />
                                            <div>
                                                <span className={styles.statusLabel}>Premium Life Guidance</span>
                                                <span className={styles.statusDate}>Generated on {new Date(report.updatedAt || Date.now()).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className={styles.statusActions}>
                                            <button onClick={handleGenerate} className={styles.refreshBtn} title="Refresh Report Content">
                                                <Zap size={16} /> Refresh
                                            </button>
                                            <a href={`/api/reports/${id}/download`} className={styles.downloadBtn} target="_blank">
                                                <Download size={18} />
                                                Download PDF
                                            </a>
                                        </div>
                                    </div>

                                    {/* Content Check: If empty/legacy, show prompt to regenerate */}
                                    {!report.content?.chapter1_SoulPurpose ? (
                                        <div className={styles.emptyContentState}>
                                            <h3>Report Generation Required</h3>
                                            <p>Your premium life guidance is waiting to be synthesized.</p>
                                            <button className={styles.generateBtn} onClick={handleGenerate} disabled={loading}>
                                                {loading ? 'Synthesizing...' : 'Generate Report Now'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={styles.downloadCenter}>
                                            <div className={styles.downloadCard}>
                                                <div className={styles.fileIcon}>
                                                    <FileText size={64} strokeWidth={1} />
                                                </div>
                                                <h2>Your Guidance is Ready</h2>
                                                <p>Your 10-chapter Premium Life Report has been generated and compiled into a secure PDF document.</p>

                                                <div className={styles.actionRow}>
                                                    <a href={`/api/reports/${id}/download`} className={styles.primaryDownloadBtn} target="_blank">
                                                        <Download size={20} />
                                                        Download PDF Report
                                                    </a>
                                                </div>

                                                <button onClick={handleGenerate} className={styles.textRegenBtn} disabled={loading}>
                                                    {loading ? 'Updating...' : 'Regenerate Analysis'}
                                                </button>
                                                <p className={styles.subtext}>
                                                    Regenerating will overwrite the existing report with fresh insights.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </main>

            {loading && <div className={styles.overlay}><div className={styles.spinner}></div></div>}
        </div>
    );
}

export default function ReportPage({ params }: ReportPageProps) {
    return (
        <ProfileGuard>
            <ReportContent params={params} />
        </ProfileGuard>
    );
}
