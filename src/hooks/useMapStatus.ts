import { useState, useEffect } from 'react';
import { AviationWeatherService } from '../services/weather';
import { ScoringEngine } from '../logic/scoring';
import { AIRPORTS } from '../data/airports';
import type { TrainingProfile } from '../types/profile';

export type StatusColor = 'green' | 'red' | 'yellow' | 'gray';

export const useMapStatus = (profile: TrainingProfile, targetDate: Date | null = null) => {
    const [statuses, setStatuses] = useState<Record<string, StatusColor>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchStatuses = async () => {
            setLoading(true);
            const icaoList = AIRPORTS.map(a => a.icao);

            const newStatuses: Record<string, StatusColor> = {};
            // Default all to gray first
            icaoList.forEach(id => newStatuses[id] = 'gray');

            if (targetDate) {
                console.log('[MapDebug] Fetching TAFs for Forecast:', targetDate);
                const tafs = await AviationWeatherService.getTafs(icaoList);

                tafs.forEach(taf => {
                    if (!taf.station_id) return;

                    const windows = AviationWeatherService.normalizeTaf(taf);
                    // Find window covering targetDate
                    const match = windows.find(w =>
                        targetDate >= w.startTime && targetDate < w.endTime
                    );

                    if (match) {
                        const score = ScoringEngine.calculateSuitability(match, profile);
                        let color: StatusColor = 'gray';
                        if (score.score >= 80) color = 'green';
                        else if (score.score >= 50) color = 'yellow';
                        else color = 'red';

                        newStatuses[taf.station_id.toUpperCase()] = color;
                    }
                });

            } else {
                console.log('[MapDebug] Fetching METARs for LIVE');
                const metars = await AviationWeatherService.getMetars(icaoList);

                metars.forEach(metar => {
                    if (!metar.station_id) return;

                    const window = AviationWeatherService.normalizeMetar(metar);
                    const score = ScoringEngine.calculateSuitability(window, profile);

                    let color: StatusColor = 'gray';
                    if (score.score >= 80) color = 'green';
                    else if (score.score >= 50) color = 'yellow';
                    else color = 'red';

                    const id = metar.station_id.toUpperCase();
                    newStatuses[id] = color;
                });
            }

            setStatuses(newStatuses);
            setLoading(false);
        };

        fetchStatuses();

        // Refresh every 5 minutes
        const interval = setInterval(fetchStatuses, 5 * 60 * 1000);
        return () => clearInterval(interval);

    }, [profile, targetDate]);

    return { statuses, loading };
};
