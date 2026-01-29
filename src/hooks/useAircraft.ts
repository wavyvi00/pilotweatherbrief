
import { useState, useEffect } from 'react';
import type { Aircraft } from '../types/aircraft';
import { DEFAULT_AIRCRAFT } from '../config/aircraft';

const STORAGE_KEY = 'flightsolo_aircraft_v1';
const ACTIVE_KEY = 'flightsolo_active_aircraft_id';

export const useAircraft = () => {
    // Load Fleet
    const [fleet, setFleet] = useState<Aircraft[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : DEFAULT_AIRCRAFT;
        } catch (e) {
            console.error('Failed to load aircraft:', e);
            return DEFAULT_AIRCRAFT;
        }
    });

    // Load Active ID
    const [activeAircraftId, setActiveAircraftId] = useState<string>(() => {
        return localStorage.getItem(ACTIVE_KEY) || DEFAULT_AIRCRAFT[0].id;
    });

    // Persist
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fleet));
    }, [fleet]);

    useEffect(() => {
        localStorage.setItem(ACTIVE_KEY, activeAircraftId);
    }, [activeAircraftId]);

    // Computed
    const activeAircraft = fleet.find(a => a.id === activeAircraftId) || fleet[0] || DEFAULT_AIRCRAFT[0];

    // Actions
    const addAircraft = (aircraft: Omit<Aircraft, 'id'>) => {
        const newAircraft = {
            ...aircraft,
            id: `ac-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        setFleet(prev => [...prev, newAircraft]);
        setActiveAircraftId(newAircraft.id); // Auto switch to new
    };

    const updateAircraft = (id: string, updates: Partial<Aircraft>) => {
        setFleet(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    };

    const deleteAircraft = (id: string) => {
        if (fleet.length <= 1) {
            alert("You must have at least one aircraft.");
            return;
        }
        setFleet(prev => prev.filter(a => a.id !== id));
        if (activeAircraftId === id) {
            // Switch to first available
            const remaining = fleet.filter(a => a.id !== id);
            if (remaining.length > 0) setActiveAircraftId(remaining[0].id);
        }
    };

    return {
        fleet,
        activeAircraft,
        activeAircraftId,
        setActiveAircraftId,
        addAircraft,
        updateAircraft,
        deleteAircraft
    };
};
