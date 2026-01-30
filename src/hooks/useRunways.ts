import { useState, useEffect } from 'react';

interface RunwaysState {
    runways: string[];
    loading: boolean;
    error: string | null;
}

// Simple in-memory cache
const cache: Record<string, string[]> = {};

export const useRunways = (stationId: string) => {
    const [state, setState] = useState<RunwaysState>({
        runways: [],
        loading: false,
        error: null
    });

    useEffect(() => {
        if (!stationId || stationId.length < 3) {
            setState({ runways: [], loading: false, error: null });
            return;
        }

        const icao = stationId.toUpperCase();

        // Check cache first
        if (cache[icao]) {
            setState({ runways: cache[icao], loading: false, error: null });
            return;
        }

        setState(prev => ({ ...prev, loading: true, error: null }));

        const fetchRunways = async () => {
            try {
                const response = await fetch(`/api/runways?icao=${icao}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch runways');
                }

                const data = await response.json();
                const runways = data.runways || [];

                // Cache the result
                cache[icao] = runways;

                setState({
                    runways,
                    loading: false,
                    error: null
                });
            } catch (err) {
                console.error('Error fetching runways:', err);
                setState({
                    runways: [],
                    loading: false,
                    error: 'Could not load runway data'
                });
            }
        };

        fetchRunways();
    }, [stationId]);

    return state;
};
