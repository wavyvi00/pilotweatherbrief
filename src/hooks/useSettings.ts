import { useState, useEffect } from 'react';

export interface UserSettings {
    defaultAirport: string;
    defaultAircraftId: string | null;
    defaultProfileId: string | null;
}

const STORAGE_KEY = 'flightsolo_settings_v1';

const DEFAULT_SETTINGS: UserSettings = {
    defaultAirport: 'KMCI',
    defaultAircraftId: null, // null means use first available
    defaultProfileId: null,  // null means use first available
};

export const useSettings = () => {
    const [settings, setSettings] = useState<UserSettings>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
        } catch (error) {
            console.error('Failed to load settings:', error);
            return DEFAULT_SETTINGS;
        }
    });

    // Persist changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
    };

    return {
        settings,
        updateSetting,
        resetSettings
    };
};
