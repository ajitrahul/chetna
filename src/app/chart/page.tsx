'use client';

import { useState, useEffect } from 'react';
import BirthDataForm, { UserProfile } from '@/components/BirthDataForm';
import ChartDisplay from '@/components/ChartDisplay';
import DashaDisplay from '@/components/DashaDisplay';
import { ChartData } from '@/lib/astrology/calculator';
import styles from './page.module.css';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PlusCircle, ArrowLeft } from 'lucide-react';

export default function ChartPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Initial Profile Fetch
    useEffect(() => {
        async function fetchProfile() {
            if (status === 'loading') return;
            if (status === 'unauthenticated') {
                // Optionally redirect to login or show simplified view
                setLoading(false);
                return;
            }

            try {
                const res = await fetch('/api/user/profile');
                if (res.ok) {
                    const data = await res.json();
                    setProfile({
                        ...data,
                        // Ensure dates are parsed
                        dateOfBirth: new Date(data.dateOfBirth),
                        chartData: data.chartData as ChartData
                    });
                }
            } catch (error) {
                console.error('Failed to load profile:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [status]);

    const handleChartGenerated = async (data: ChartData) => {
        // Fetch the latest profile data to get the full updated object (name, dates, etc.)
        try {
            setLoading(true);
            const res = await fetch('/api/user/profile');
            if (res.ok) {
                const updatedProfile = await res.json();
                setProfile({
                    ...updatedProfile,
                    dateOfBirth: new Date(updatedProfile.dateOfBirth),
                    chartData: updatedProfile.chartData as ChartData
                });
                setIsEditing(false); // Close the form
            }
        } catch (error) {
            console.error('Failed to refresh profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
            </div>
        );
    }

    // ONBOARDING MODE: No Profile Found
    if (!profile && !loading) {
        return (
            <div className={`container ${styles.pageContainer}`}>
                <div className="max-w-2xl mx-auto text-center mb-12">
                    <h1 className={styles.title}>Welcome to Chetna</h1>
                    <p className={styles.subtitle}>
                        To verify the stars, we first need to know where you stand. <br />
                        Please enter your birth details to begin your journey.
                    </p>
                </div>

                <div className={styles.formWrapper}>
                    <BirthDataForm onChartGenerated={handleChartGenerated} />
                </div>
            </div>
        );
    }

    // ADD NEW PROFILE MODE
    if (isEditing) {
        return (
            <div className={`container ${styles.pageContainer}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className={styles.title}>Add New Profile</h1>
                        <p className={styles.subtitle}>Create a fresh profile. This will replace your current active one.</p>
                    </div>
                    <button
                        onClick={() => setIsEditing(false)}
                        className={styles.backLinkBtn}
                    >
                        <ArrowLeft size={16} />
                        Back to Chart
                    </button>
                </div>
                <div className={styles.formWrapper}>
                    <BirthDataForm
                        onChartGenerated={handleChartGenerated}
                        initialData={profile!}
                    />
                </div>
            </div>
        );
    }

    // DISPLAY MODE: Profile Exists
    return (
        <div className={`container ${styles.pageContainer}`}>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h1 className={styles.title}>Your Chart</h1>
                    <div className={styles.subtitle}>
                        <p>Prepared for <span className="text-[var(--primary)] font-semibold">{profile?.name}</span> • {new Date(profile!.dateOfBirth).toLocaleDateString()}</p>
                        <p className="text-xs text-[var(--secondary)] mt-1 opacity-70">
                            Chart calculated on {new Date(profile!.updatedAt as unknown as string).toLocaleDateString()} at {new Date(profile!.updatedAt as unknown as string).toLocaleTimeString()}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setIsEditing(true)}
                        className={styles.addProfileBtn}
                    >
                        <PlusCircle size={18} />
                        Add Profile
                    </button>
                </div>
            </div>

            {profile?.chartData ? (
                <div id="chart-display-section" className={styles.chartSection}>
                    <ChartDisplay data={profile.chartData} />
                    <DashaDisplay dashas={profile.chartData.dashas} />
                </div>
            ) : (
                <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg">
                    Chart data appears to be missing. Please edit your details to regenerate.
                </div>
            )}
        </div>
    );
}
