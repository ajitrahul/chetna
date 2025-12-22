'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import ProfileManager, { UserProfile } from './ProfileManager';

export default function BirthDataForm() {
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

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (saveProfile && formData.name) {
            const newProfile: UserProfile = {
                id: Date.now().toString(),
                name: formData.name,
                dob: formData.dob,
                tob: formData.tob,
                pob: formData.pob
            };

            // Avoid duplicates roughly
            const exists = profiles.find(p => p.name === newProfile.name && p.dob === newProfile.dob);
            if (!exists) {
                setProfiles([...profiles, newProfile]);
            }
        }

        // Navigate or Show Chart logic would go here
        console.log('Generating chart for:', formData);
        // In a real app: router.push('/chart/view?data=...')
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

                <button
                    type="submit"
                    className="w-full py-3 mt-4 bg-[var(--primary)] text-white font-medium rounded-[var(--radius-md)] hover:bg-[var(--primary-hover)] transition-colors shadow-lg"
                >
                    View My Chart
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
        `}</style>
            </form>
        </div>
    );
}
