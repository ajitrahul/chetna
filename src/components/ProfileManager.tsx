'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/context/ProfileContext';
import ProfileDrawer from './ProfileDrawer';
import ProfileLimitModal from './ProfileLimitModal';

export default function ProfileManager() {
    const router = useRouter();
    const {
        isDrawerOpen,
        isLimitModalOpen,
        profileData,
        closeDrawer,
        closeLimitModal,
        handleUpgrade,
        refreshProfileData
    } = useProfile();

    const handleSuccess = (newProfile?: any) => {
        closeDrawer();
        refreshProfileData();

        // Redirect to the chart page for the newly created profile
        if (newProfile && newProfile.id) {
            router.push(`/chart?profileId=${newProfile.id}`);
        } else {
            router.push('/chart');
        }
    };

    const handleManageProfiles = () => {
        closeLimitModal();
        router.push('/dashboard?section=profiles');
    };

    return (
        <>
            <ProfileDrawer
                isOpen={isDrawerOpen}
                onClose={closeDrawer}
                onSuccess={handleSuccess}
            />

            <ProfileLimitModal
                isOpen={isLimitModalOpen}
                onClose={closeLimitModal}
                onUpgrade={handleUpgrade}
                onManageProfiles={handleManageProfiles}
                currentCount={profileData?.profiles?.length || 0}
                maxProfiles={profileData?.limit || 5}
                expansionCost={profileData?.expansionCost || 50}
            />
        </>
    );
}
