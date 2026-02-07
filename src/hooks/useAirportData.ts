import { useState, useEffect } from 'react';
import { useRunways } from './useRunways';
import axios from 'axios';



export const useAirportData = (stationId: string, lat?: number, lon?: number) => {
    const { runways, loading: runwaysLoading } = useRunways(stationId);
    const [elevation, setElevation] = useState<number | undefined>(undefined);
    const [elevationLoading, setElevationLoading] = useState(false);

    // Calculate max runway length
    const maxRunwayLength = runways.length > 0
        ? Math.max(...runways.map(r => r.length))
        : undefined;

    // Fetch Elevation
    useEffect(() => {
        if (!lat || !lon) return;

        const fetchElevation = async () => {
            setElevationLoading(true);
            try {
                // Fetch elevation from Open-Meteo Elevation API
                // https://api.open-meteo.com/v1/elevation?latitude=52.52&longitude=13.41
                const response = await axios.get('https://api.open-meteo.com/v1/elevation', {
                    params: {
                        latitude: lat,
                        longitude: lon
                    }
                });

                if (response.data && response.data.elevation) {
                    // API returns elevation in meters
                    setElevation(Math.round(response.data.elevation[0] * 3.28084)); // Convert to feet
                }
            } catch (error) {
                console.error('Failed to fetch elevation:', error);
            } finally {
                setElevationLoading(false);
            }
        };

        fetchElevation();
    }, [lat, lon]);

    return {
        elevation,
        maxRunwayLength,
        loading: runwaysLoading || elevationLoading
    };
};
