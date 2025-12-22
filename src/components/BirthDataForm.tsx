'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import ProfileManager, { UserProfile } from './ProfileManager';

interface BirthDataFormProps {
    onChartGenerated?: (data: any) => void;
}

export default function BirthDataForm({ onChartGenerated }: BirthDataFormProps) {
    const { data: session } = useSession();
    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        tob: '',
        pob: '',
        unknownTime: false
    });

    const [profiles, setProfiles] = useLocalStorage<UserProfile[]>('chetna_profiles', []);
    const [saveProfile, setSaveProfile] = useState(false);

    // Hydration fix for client-only logic
    const [isClient, setIsClient] = useState(false);
    useEffect(() => setIsClient(true), []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const loadProfile = (profile: UserProfile) => {
        setFormData({
            name: profile.name,
            dob: profile.dob,
            tob: profile.tob,
            pob: profile.pob,
            unknownTime: !profile.tob
        });
    };

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Geocode the Place of Birth
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.pob)}&limit=1`);
            const geoData = await geoRes.json();

            if (!geoData || geoData.length === 0) {
                throw new Error("Could not find coordinates for this location.");
            }

            const lat = parseFloat(geoData[0].lat);
            const lng = parseFloat(geoData[0].lon);

            // 2. Parse Date and Time
            const dobDate = new Date(formData.dob);
            const [hours, minutes] = formData.tob.split(':').map(Number);

            // 3. Calculate Chart (API Call)
            const calcRes = await fetch('/api/astrology/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    year: dobDate.getFullYear(),
                    month: dobDate.getMonth() + 1,
                    day: dobDate.getDate(),
                    hour: hours || 12,
                    minute: minutes || 0,
                    lat,
                    lng
                }),
            });

            if (!calcRes.ok) throw new Error("Failed to calculate chart.");
            const chartResult = await calcRes.json();

            if (onChartGenerated) {
                onChartGenerated(chartResult);
            }

            console.log('Real Chart Generated:', chartResult);

            if (saveProfile && formData.name) {
                // If logged in, save to DB
                if (session?.user?.id) {
                    try {
                        await fetch('/api/profiles', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                name: formData.name,
                                dateOfBirth: formData.dob,
                                timeOfBirth: formData.tob,
                                placeOfBirth: formData.pob,
                                latitude: lat,
                                longitude: lng,
                                chartData: chartResult
                            }),
                        });
                    } catch (err) {
                        console.error('Failed to save profile to DB:', err);
                    }
                } else {
                    // Fallback to localStorage for guests
                    const newProfile: UserProfile = {
                        id: Date.now().toString(),
                        name: formData.name,
                        dob: formData.dob,
                        tob: formData.tob,
                        pob: formData.pob,
                        lat,
                        lng,
                        chartData: chartResult
                    };

                    const exists = profiles.find(p => p.name === newProfile.name && p.dob === newProfile.dob);
                    if (!exists) {
                        setProfiles([...profiles, newProfile]);
                    }
                }
            }

            alert("Chart Generated Successfully!");

        } catch (err: any) {
            console.error('BirthDataForm Error:', err);
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (!isClient) return null;

    return (
        <div>
            <ProfileManager onSelectProfile={loadProfile} />

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="form-group">
                    <label className="block mb-2 font-medium text-current">Name (for your profile)</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Rahul"
                        className="w-full p-3 border border-[var(--card-border)] rounded-[var(--radius-md)] bg-[rgba(255,255,255,0.5)]"
                    />
                </div>

                <div className="form-group">
                    <label className="block mb-2 font-medium text-current">Date of Birth</label>
                    <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className="w-full p-3 border border-[var(--card-border)] rounded-[var(--radius-md)] bg-[rgba(255,255,255,0.5)]"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="block mb-2 font-medium text-current">Time of Birth</label>
                    <div className="flex gap-4">
                        <input
                            type="time"
                            name="tob"
                            value={formData.tob}
                            onChange={handleChange}
                            disabled={formData.unknownTime}
                            className="flex-1 p-3 border border-[var(--card-border)] rounded-[var(--radius-md)] bg-[rgba(255,255,255,0.5)] disabled:opacity-50"
                        />
                        <label className="flex items-center gap-2 text-sm text-[var(--secondary)] cursor-pointer">
                            <input
                                type="checkbox"
                                name="unknownTime"
                                checked={formData.unknownTime}
                                onChange={handleChange}
                            />
                            Unknown
                        </label>
                    </div>
                </div>

                <div className="form-group">
                    <label className="block mb-2 font-medium text-current">Place of Birth</label>
                    <input
                        type="text"
                        name="pob"
                        value={formData.pob}
                        onChange={handleChange}
                        placeholder="City, Country"
                        className="w-full p-3 border border-[var(--card-border)] rounded-[var(--radius-md)] bg-[rgba(255,255,255,0.5)]"
                        required
                    />
                </div>

                <label className="flex items-center gap-2 text-sm text-[var(--primary)] cursor-pointer mt-2">
                    <input
                        type="checkbox"
                        checked={saveProfile}
                        onChange={(e) => setSaveProfile(e.target.checked)}
                    />
                    Save this profile to my circle
                </label>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full py-3 mt-4 bg-[var(--primary)] text-white font-medium rounded-[var(--radius-md)] hover:bg-[var(--primary-hover)] transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    {loading ? 'Calculating Patterns...' : 'View My Chart'}
                </button>

                <style jsx>{`
          .flex { display: flex; }
          .flex-col { flex-direction: column; }
          .gap-6 { gap: 24px; }
          .gap-4 { gap: 16px; }
          .gap-2 { gap: 8px; }
          .block { display: block; }
          .mb-2 { margin-bottom: 8px; }
          .w-full { width: 100%; }
          .p-3 { padding: 12px; }
          .items-center { align-items: center; }
          .text-sm { font-size: 0.875rem; }
          .mt-2 { margin-top: 8px; }
          .mt-4 { margin-top: 16px; }
          .font-medium { font-weight: 500; }
          .cursor-pointer { cursor: pointer; }
          .shadow-lg { box-shadow: 0 4px 14px rgba(0,0,0,0.1); }
          .bg-red-50 { background-color: #fef2f2; }
          .border-red-200 { border-color: #fecaca; }
          .text-red-600 { color: #dc2626; }
          .rounded-md { border-radius: 6px; }
        `}</style>
            </form>
        </div>
    );
}
