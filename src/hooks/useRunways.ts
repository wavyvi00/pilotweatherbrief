import { useState, useEffect } from 'react';

interface RunwaysState {
    runways: Runway[];
    loading: boolean;
    error: string | null;
}

export interface Runway {
    ident: string;
    length: number; // feet
    width: number; // feet
    surface: string;
}

// Global cache for parsed runway data
let runwayDataCache: Record<string, Runway[]> | null = null;
let cachePromise: Promise<Record<string, Runway[]>> | null = null;

// Parse CSV and build runway map
async function loadRunwayData(): Promise<Record<string, Runway[]>> {
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
        const lengthIdx = headers.indexOf('length_ft');
        const widthIdx = headers.indexOf('width_ft');
        const surfaceIdx = headers.indexOf('surface');
        const closedIdx = headers.indexOf('closed');

        const runwayMap: Record<string, Runway[]> = {};

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Simple CSV parse (OurAirports data is clean)
            // Note: This simple split fails on quoted strings with commas, but OurAirports usually ok.
            // Ideally use a CSV parser libraries but keeping it lightweight.
            const cols = line.split(',').map(c => c.replace(/"/g, '').trim());

            const airportIdent = cols[airportIdentIdx];
            const leIdent = cols[leIdentIdx];
            const heIdent = cols[heIdentIdx];
            const length = parseInt(cols[lengthIdx]) || 0;
            const width = parseInt(cols[widthIdx]) || 0;
            const surface = cols[surfaceIdx] || '';
            const closed = cols[closedIdx];

            // Skip closed runways
            if (closed === '1') continue;

            if (airportIdent && leIdent) {
                if (!runwayMap[airportIdent]) {
                    runwayMap[airportIdent] = [];
                }

                // Add reciprocal ends (e.g. 09 and 27)
                // We store them as separate entries for easier lookup/display in UI
                // Or maybe store as one runway object?
                // The RunwayWindCalculator expects identifiers.
                // Let's store objects for each end to simplify usage

                if (leIdent) {
                    runwayMap[airportIdent].push({ ident: leIdent, length, width, surface });
                }
                if (heIdent) {
                    runwayMap[airportIdent].push({ ident: heIdent, length, width, surface });
                }
            }
        }

        // Sort runways
        const result: Record<string, Runway[]> = {};
        for (const key in runwayMap) {
            result[key] = runwayMap[key].sort((a, b) => {
                const numA = parseInt(a.ident.replace(/[LRC]/g, ''));
                const numB = parseInt(b.ident.replace(/[LRC]/g, ''));
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
