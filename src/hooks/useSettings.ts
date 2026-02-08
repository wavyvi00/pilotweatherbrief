import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserSettings, updateUserSettings } from '../lib/sync';

export interface UserSettings {
    defaultAirport: string;
    defaultAircraftId: string | null;
    defaultProfileId: string | null;
}

const STORAGE_KEY = 'flightsolo_settings_v1';

const DEFAULT_SETTINGS: UserSettings = {
    defaultAirport: 'KMCI',
    defaultAircraftId: null,
    defaultProfileId: null,
};

export const useSettings = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    // Load data on mount and when auth changes
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            
            if (user) {
                try {
                    const cloudSettings = await fetchUserSettings(user.id);
                    if (cloudSettings) {
                        setSettings({
                            defaultAirport: cloudSettings.defaultAirport,
                            defaultAircraftId: cloudSettings.defaultAircraftId,
                            defaultProfileId: cloudSettings.defaultProfileId,
                        });
                    } else {
                        // First login - use localStorage settings
                        const localSettings = loadFromLocalStorage();
                        setSettings(localSettings);
                        // Sync to cloud
                        await updateUserSettings(user.id, {
                            defaultAirport: localSettings.defaultAirport,
                            defaultAircraftId: localSettings.defaultAircraftId,
                            defaultProfileId: localSettings.defaultProfileId,
                        });
                    }
                } catch (error) {
                    console.error('Failed to load settings from cloud:', error);
                    setSettings(loadFromLocalStorage());
                }
            } else {
                setSettings(loadFromLocalStorage());
            }
            
            setLoading(false);
        };
        
        loadData();
    }, [user]);

    // Persist to localStorage always
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    const loadFromLocalStorage = (): UserSettings => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
        } catch (error) {
            console.error('Failed to load settings:', error);
            return DEFAULT_SETTINGS;
        }
    };

    const updateSetting = useCallback(<K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
        setSettings(prev => {
            const newSettings = { ...prev, [key]: value };
            
            if (user) {
                // Map key names to cloud column names
                const cloudUpdate: Record<string, any> = {};
                if (key === 'defaultAirport') cloudUpdate.defaultAirport = value;
                if (key === 'defaultAircraftId') cloudUpdate.defaultAircraftId = value;
                if (key === 'defaultProfileId') cloudUpdate.defaultProfileId = value;
                
                updateUserSettings(user.id, cloudUpdate).catch(err =>
                    console.error('Failed to update settings in cloud:', err)
                );
            }
            
            return newSettings;
        });
    }, [user]);

    const resetSettings = useCallback(async () => {
        setSettings(DEFAULT_SETTINGS);
        
        if (user) {
            try {
                await updateUserSettings(user.id, {
                    defaultAirport: DEFAULT_SETTINGS.defaultAirport,
                    defaultAircraftId: DEFAULT_SETTINGS.defaultAircraftId,
                    defaultProfileId: DEFAULT_SETTINGS.defaultProfileId,
                });
            } catch (error) {
                console.error('Failed to reset settings in cloud:', error);
            }
        }
    }, [user]);

    return {
        settings,
        updateSetting,
        resetSettings,
        loading
    };
};
