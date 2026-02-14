
import { useState, useEffect, useCallback } from 'react';
import type { Aircraft } from '../types/aircraft';
import { DEFAULT_AIRCRAFT } from '../config/aircraft';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserAircraft, saveUserAircraft, deleteUserAircraft, syncAircraftToSupabase } from '../lib/sync';

const STORAGE_KEY = 'flightsolo_aircraft_v1';
const ACTIVE_KEY = 'flightsolo_active_aircraft_id';

export const useAircraft = () => {
    const { user } = useAuth();
    const [fleet, setFleet] = useState<Aircraft[]>([]);
    const [activeAircraftId, setActiveAircraftId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [synced, setSynced] = useState(false);

    // Load data on mount and when auth changes
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            if (user) {
                try {
                    // Fetch from Supabase
                    const cloudFleet = await fetchUserAircraft(user.id);

                    if (cloudFleet.length > 0) {
                        setFleet(cloudFleet);
                        setActiveAircraftId(cloudFleet[0].id);
                        setSynced(true);
                    } else {
                        // First login - migrate localStorage data to cloud
                        const localFleet = loadFromLocalStorage();
                        if (localFleet.length > 0) {
                            await syncAircraftToSupabase(user.id, localFleet);
                            setFleet(localFleet);
                            setActiveAircraftId(localFleet[0].id);
                            setSynced(true);
                        } else {
                            // Use defaults
                            await syncAircraftToSupabase(user.id, DEFAULT_AIRCRAFT);
                            setFleet(DEFAULT_AIRCRAFT);
                            setActiveAircraftId(DEFAULT_AIRCRAFT[0].id);
                            setSynced(true);
                        }
                    }
                } catch (error) {
                    console.error('Failed to load aircraft from cloud:', error);
                    // Fallback to localStorage
                    const localFleet = loadFromLocalStorage();
                    setFleet(localFleet);
                    setActiveAircraftId(localStorage.getItem(ACTIVE_KEY) || localFleet[0]?.id || '');
                }
            } else {
                // Not logged in - use localStorage
                const localFleet = loadFromLocalStorage();
                setFleet(localFleet);
                setActiveAircraftId(localStorage.getItem(ACTIVE_KEY) || localFleet[0]?.id || '');
                setSynced(false);
            }

            setLoading(false);
        };

        loadData();
    }, [user]);

    // Persist to localStorage always (offline backup)
    useEffect(() => {
        if (fleet.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fleet));
        }
    }, [fleet]);

    useEffect(() => {
        if (activeAircraftId) {
            localStorage.setItem(ACTIVE_KEY, activeAircraftId);
        }
    }, [activeAircraftId]);

    // Helper to load from localStorage
    const loadFromLocalStorage = (): Aircraft[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : DEFAULT_AIRCRAFT;
        } catch (e) {
            console.error('Failed to load aircraft from localStorage:', e);
            return DEFAULT_AIRCRAFT;
        }
    };

    // Computed
    const activeAircraft = fleet.find(a => a.id === activeAircraftId) || fleet[0] || DEFAULT_AIRCRAFT[0];

    // Actions
    const addAircraft = useCallback(async (aircraft: Omit<Aircraft, 'id'>) => {
        const newAircraft: Aircraft = {
            ...aircraft,
            id: `ac-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };

        setFleet(prev => [...prev, newAircraft]);
        setActiveAircraftId(newAircraft.id);

        if (user) {
            try {
                await saveUserAircraft(user.id, newAircraft);
            } catch (error) {
                console.error('Failed to save aircraft to cloud:', error);
            }
        }
        return newAircraft.id;
    }, [user]);

    const updateAircraft = useCallback(async (id: string, updates: Partial<Aircraft>) => {
        setFleet(prev => {
            const updated = prev.map(a => a.id === id ? { ...a, ...updates } : a);

            if (user) {
                const updatedAircraft = updated.find(a => a.id === id);
                if (updatedAircraft) {
                    saveUserAircraft(user.id, updatedAircraft).catch(err =>
                        console.error('Failed to update aircraft in cloud:', err)
                    );
                }
            }

            return updated;
        });
    }, [user]);

    const deleteAircraft = useCallback(async (id: string) => {
        if (fleet.length <= 1) {
            alert("You must have at least one aircraft.");
            return;
        }

        setFleet(prev => prev.filter(a => a.id !== id));

        if (activeAircraftId === id) {
            const remaining = fleet.filter(a => a.id !== id);
            if (remaining.length > 0) setActiveAircraftId(remaining[0].id);
        }

        if (user) {
            try {
                await deleteUserAircraft(id);
            } catch (error) {
                console.error('Failed to delete aircraft from cloud:', error);
            }
        }
    }, [user, fleet, activeAircraftId]);

    return {
        fleet,
        activeAircraft,
        activeAircraftId,
        setActiveAircraftId,
        addAircraft,
        updateAircraft,
        deleteAircraft,
        loading,
        synced
    };
};
