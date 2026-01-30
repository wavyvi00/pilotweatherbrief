import { useState, useEffect } from 'react';

interface RunwaysState {
    runways: string[];
    loading: boolean;
    error: string | null;
}

// Global cache for parsed runway data
let runwayDataCache: Record<string, string[]> | null = null;
let cachePromise: Promise<Record<string, string[]>> | null = null;

// Parse CSV and build runway map
async function loadRunwayData(): Promise<Record<string, string[]>> {
    // Return cached data if available
    if (runwayDataCache) {
        return runwayDataCache;
    }

    // If already fetching, wait for that promise
    if (cachePromise) {
        return cachePromise;
    }

    // Fetch and parse the CSV
    cachePromise = (async () => {
        const response = await fetch(
            'https://davidmegginson.github.io/ourairports-data/runways.csv'
        );

        if (!response.ok) {
            throw new Error('Failed to fetch runway data');
        }

        const text = await response.text();
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

        // Find column indices
        const airportIdentIdx = headers.indexOf('airport_ident');
        const leIdentIdx = headers.indexOf('le_ident');
        const heIdentIdx = headers.indexOf('he_ident');
        const closedIdx = headers.indexOf('closed');

        const runwayMap: Record<string, Set<string>> = {};

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Simple CSV parse (OurAirports data is clean)
            const cols = line.split(',').map(c => c.replace(/"/g, '').trim());

            const airportIdent = cols[airportIdentIdx];
            const leIdent = cols[leIdentIdx];
            const heIdent = cols[heIdentIdx];
            const closed = cols[closedIdx];

            // Skip closed runways
            if (closed === '1') continue;

            if (airportIdent && leIdent) {
                if (!runwayMap[airportIdent]) {
                    runwayMap[airportIdent] = new Set();
                }
                if (leIdent) runwayMap[airportIdent].add(leIdent);
                if (heIdent) runwayMap[airportIdent].add(heIdent);
            }
        }

        // Convert Sets to sorted Arrays
        const result: Record<string, string[]> = {};
        for (const key in runwayMap) {
            result[key] = Array.from(runwayMap[key]).sort((a, b) => {
                const numA = parseInt(a.replace(/[LRC]/g, ''));
                const numB = parseInt(b.replace(/[LRC]/g, ''));
                return numA - numB;
            });
        }

        runwayDataCache = result;
        return result;
    })();

    return cachePromise;
}

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

        // Check if we already have cached data for this airport
        if (runwayDataCache && runwayDataCache[icao]) {
            setState({ runways: runwayDataCache[icao], loading: false, error: null });
            return;
        }

        setState(prev => ({ ...prev, loading: true, error: null }));

        const fetchRunways = async () => {
            try {
                const data = await loadRunwayData();
                const runways = data[icao] || [];

                setState({
                    runways,
                    loading: false,
                    error: runways.length === 0 ? null : null
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
