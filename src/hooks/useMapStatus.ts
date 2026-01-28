import { useState, useEffect } from 'react';
import { AviationWeatherService } from '../services/weather';
import { ScoringEngine } from '../logic/scoring';
import { AIRPORTS } from '../data/airports';
import type { TrainingProfile } from '../types/profile';

export type StatusColor = 'green' | 'red' | 'yellow' | 'gray';

export const useMapStatus = (profile: TrainingProfile) => {
    const [statuses, setStatuses] = useState<Record<string, StatusColor>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchStatuses = async () => {
            setLoading(true);
            const icaoList = AIRPORTS.map(a => a.icao);

            console.log('[MapDebug] Fetching METARs for:', icaoList);

            // Batch fetch METARs
            const metars = await AviationWeatherService.getMetars(icaoList);
            if (metars.length > 0) {
                console.log('[MapDebug] First Raw METAR:', metars[0]);
                console.log('[MapDebug] Station ID check:', metars[0].station_id);
            }
            console.log('[MapDebug] Received METARs:', metars);

            const newStatuses: Record<string, StatusColor> = {};

            // Default all to gray first
            icaoList.forEach(id => newStatuses[id] = 'gray');

            // Process fetched
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

            console.log('[MapDebug] Computed Statuses:', newStatuses);
            setStatuses(newStatuses);
            setLoading(false);
        };

        fetchStatuses();

        // Refresh every 5 minutes
        const interval = setInterval(fetchStatuses, 5 * 60 * 1000);
        return () => clearInterval(interval);

    }, [profile]); // Re-run if profile changes (limits change -> colors change)

    return { statuses, loading };
};
