import { useState, useEffect } from 'react';
import type { TrainingProfile } from '../types/profile';
import { DEFAULT_PROFILES } from '../config/profiles';

const STORAGE_KEY = 'aeroplan_profiles_v1';

export const useProfiles = () => {
    const [profiles, setProfiles] = useState<TrainingProfile[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : DEFAULT_PROFILES;
        } catch (error) {
            console.error('Failed to load profiles:', error);
            return DEFAULT_PROFILES;
        }
    });

    const [activeProfileId, setActiveProfileId] = useState<string>(() => {
        return localStorage.getItem(STORAGE_KEY + '_active') || DEFAULT_PROFILES[0].id;
    });

    // Persist changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    }, [profiles]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY + '_active', activeProfileId);
    }, [activeProfileId]);

    const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

    const updateProfile = (updated: TrainingProfile) => {
        setProfiles(prev => prev.map(p => p.id === updated.id ? updated : p));
    };

    const resetProfiles = () => {
        setProfiles(DEFAULT_PROFILES);
        setActiveProfileId(DEFAULT_PROFILES[0].id);
    };

    return {
        profiles,
        activeProfile,
        setActiveProfileId,
        updateProfile,
        resetProfiles
    };
};
