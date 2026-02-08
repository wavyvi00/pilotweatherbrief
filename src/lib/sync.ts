import { supabase } from './supabase';
import type { Aircraft } from '../types/aircraft';
import type { TrainingProfile, TrainingLimits } from '../types/profile';

// ============ AIRCRAFT ============

interface AircraftRow {
    id: string;
    user_id: string;
    registration: string;
    type: string;
    name: string | null;
    performance: Record<string, any>;
    stations: Record<string, any>[];
    cg_envelope: Record<string, any>[];
    color: string | null;
    is_active: boolean;
}

export async function fetchUserAircraft(userId: string): Promise<Aircraft[]> {
    const { data, error } = await supabase
        .from('aircraft')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
    
    if (error) throw error;
    if (!data || data.length === 0) return [];
    
    return (data as AircraftRow[]).map(row => ({
        id: row.id,
        registration: row.registration,
        type: row.type,
        name: row.name || row.type,
        performance: row.performance as Aircraft['performance'],
        stations: row.stations as Aircraft['stations'],
        cgEnvelope: row.cg_envelope as Aircraft['cgEnvelope'],
        color: row.color || undefined,
    }));
}

export async function saveUserAircraft(userId: string, aircraft: Aircraft): Promise<void> {
    const { error } = await supabase.from('aircraft').upsert({
        id: aircraft.id,
        user_id: userId,
        registration: aircraft.registration,
        type: aircraft.type,
        name: aircraft.name,
        performance: aircraft.performance,
        stations: aircraft.stations,
        cg_envelope: aircraft.cgEnvelope,
        color: aircraft.color || null,
    });
    if (error) throw error;
}

export async function deleteUserAircraft(aircraftId: string): Promise<void> {
    const { error } = await supabase.from('aircraft').delete().eq('id', aircraftId);
    if (error) throw error;
}

export async function syncAircraftToSupabase(userId: string, fleet: Aircraft[]): Promise<void> {
    // Upsert all aircraft
    const rows = fleet.map(aircraft => ({
        id: aircraft.id,
        user_id: userId,
        registration: aircraft.registration,
        type: aircraft.type,
        name: aircraft.name,
        performance: aircraft.performance,
        stations: aircraft.stations,
        cg_envelope: aircraft.cgEnvelope,
        color: aircraft.color || null,
    }));
    
    const { error } = await supabase.from('aircraft').upsert(rows);
    if (error) throw error;
}

// ============ TRAINING PROFILES ============

interface TrainingProfileRow {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    limits: Record<string, any>;
    endorsements: string[] | null;
    is_active: boolean;
}

export async function fetchUserProfiles(userId: string): Promise<TrainingProfile[]> {
    const { data, error } = await supabase
        .from('training_profiles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
    
    if (error) throw error;
    if (!data || data.length === 0) return [];
    
    return (data as TrainingProfileRow[]).map(row => ({
        id: row.id,
        name: row.name,
        description: row.description || '',
        limits: row.limits as TrainingLimits,
        endorsements: row.endorsements || [],
    }));
}

export async function syncProfilesToSupabase(userId: string, profiles: TrainingProfile[]): Promise<void> {
    const rows = profiles.map(profile => ({
        id: profile.id,
        user_id: userId,
        name: profile.name,
        description: profile.description,
        limits: profile.limits,
        endorsements: profile.endorsements,
    }));
    
    const { error } = await supabase.from('training_profiles').upsert(rows);
    if (error) throw error;
}

// ============ USER PROFILE / SETTINGS ============

export async function fetchUserSettings(userId: string): Promise<{ defaultAirport: string; theme: string } | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('default_airport, theme')
        .eq('id', userId)
        .single();
    
    if (error) return null;
    return {
        defaultAirport: data?.default_airport || 'KMCI',
        theme: data?.theme || 'dark',
    };
}

export async function updateUserSettings(userId: string, settings: { defaultAirport?: string; theme?: string }): Promise<void> {
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (settings.defaultAirport !== undefined) updates.default_airport = settings.defaultAirport;
    if (settings.theme !== undefined) updates.theme = settings.theme;
    
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    if (error) throw error;
}
