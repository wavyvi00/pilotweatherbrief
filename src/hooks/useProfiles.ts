import { useState, useEffect, useCallback } from 'react';
import type { TrainingProfile } from '../types/profile';
import { DEFAULT_PROFILES } from '../config/profiles';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserProfiles, syncProfilesToSupabase } from '../lib/sync';

const STORAGE_KEY = 'aeroplan_profiles_v1';
const ACTIVE_KEY = 'aeroplan_profiles_v1_active';

export const useProfiles = () => {
    const { user } = useAuth();
    const [profiles, setProfiles] = useState<TrainingProfile[]>([]);
    const [activeProfileId, setActiveProfileId] = useState<string>('');
    const [loading, setLoading] = useState(true);

    // Load data on mount and when auth changes
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            
            if (user) {
                try {
                    // Fetch from Supabase
                    const cloudProfiles = await fetchUserProfiles(user.id);
                    
                    if (cloudProfiles.length > 0) {
                        setProfiles(cloudProfiles);
                        setActiveProfileId(cloudProfiles[0].id);
                    } else {
                        // First login - migrate localStorage data to cloud
                        const localProfiles = loadFromLocalStorage();
                        await syncProfilesToSupabase(user.id, localProfiles);
                        setProfiles(localProfiles);
                        setActiveProfileId(localProfiles[0].id);
                    }
                } catch (error) {
                    console.error('Failed to load profiles from cloud:', error);
                    // Fallback to localStorage
                    const localProfiles = loadFromLocalStorage();
                    setProfiles(localProfiles);
                    setActiveProfileId(localStorage.getItem(ACTIVE_KEY) || localProfiles[0]?.id || '');
                }
            } else {
                // Not logged in - use localStorage
                const localProfiles = loadFromLocalStorage();
                setProfiles(localProfiles);
                setActiveProfileId(localStorage.getItem(ACTIVE_KEY) || localProfiles[0]?.id || '');
            }
            
            setLoading(false);
        };
        
        loadData();
    }, [user]);

    // Persist to localStorage always (offline backup)
    useEffect(() => {
        if (profiles.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
        }
    }, [profiles]);

    useEffect(() => {
        if (activeProfileId) {
            localStorage.setItem(ACTIVE_KEY, activeProfileId);
        }
    }, [activeProfileId]);

    // Helper to load from localStorage
    const loadFromLocalStorage = (): TrainingProfile[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : DEFAULT_PROFILES;
        } catch (error) {
            console.error('Failed to load profiles from localStorage:', error);
            return DEFAULT_PROFILES;
        }
    };

    const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0] || DEFAULT_PROFILES[0];

    const updateProfile = useCallback(async (updated: TrainingProfile) => {
        setProfiles(prev => {
            const newProfiles = prev.map(p => p.id === updated.id ? updated : p);
            
            if (user) {
                syncProfilesToSupabase(user.id, newProfiles).catch(err =>
                    console.error('Failed to sync profiles to cloud:', err)
                );
            }
            
            return newProfiles;
        });
    }, [user]);

    const resetProfiles = useCallback(async () => {
        setProfiles(DEFAULT_PROFILES);
        setActiveProfileId(DEFAULT_PROFILES[0].id);
        
        if (user) {
            try {
                await syncProfilesToSupabase(user.id, DEFAULT_PROFILES);
            } catch (error) {
                console.error('Failed to reset profiles in cloud:', error);
            }
        }
    }, [user]);

    return {
        profiles,
        activeProfile,
        activeProfileId,
        setActiveProfileId,
        updateProfile,
        resetProfiles,
        loading
    };
};
