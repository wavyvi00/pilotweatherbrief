import { useState, useEffect } from 'react';
import type { WeatherWindow } from '../types/weather';
import { AviationWeatherService } from '../services/weather';
import { OpenMeteoService } from '../services/openMeteo';

interface UseWeatherResult {
    weatherData: WeatherWindow[];
    loading: boolean;
    error: string | null;
    refresh: () => void;
}

export function useWeather(stationId: string, lat: number, lon: number): UseWeatherResult {
    const [weatherData, setWeatherData] = useState<WeatherWindow[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        if (!stationId) return;

        setLoading(true);
        setError(null);
        try {
            // 1. Fetch Short Term (METAR + TAF)
            const metar = await AviationWeatherService.getMetar(stationId);
            const taf = await AviationWeatherService.getTaf(stationId);

            let shortTerm: WeatherWindow[] = [];
            if (metar) {
                shortTerm.push(AviationWeatherService.normalizeMetar(metar));
            }
            if (taf) {
                shortTerm = [...shortTerm, ...AviationWeatherService.normalizeTaf(taf)];
            }

            // 2. Fetch Long Term (Open-Meteo)
            // Only if we have lat/lon. 
            // TODO: In a real app we'd lookup lat/lon from the stationId if not provided.
            // For now, we assume passed or we skip.
            let longTerm: WeatherWindow[] = [];
            if (lat && lon) {
                longTerm = await OpenMeteoService.getForecast(lat, lon);
            }

            // Merge and Sort
            // We prioritize Short Term data (METAR/TAF) where it overlaps in time with Long Term.
            // Strategy: Use Short Term for 0-30h. Use Long Term for everything after last TAF entry.

            const lastTafTime = shortTerm.length > 0 ? shortTerm[shortTerm.length - 1].endTime : new Date();

            const filteredLongTerm = longTerm.filter(w => w.startTime > lastTafTime);

            const merged = [...shortTerm, ...filteredLongTerm].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

            setWeatherData(merged);
        } catch (err) {
            setError('Failed to load weather data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [stationId, lat, lon]);

    return { weatherData, loading, error, refresh: fetchData };
}
