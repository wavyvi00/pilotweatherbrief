import axios from 'axios';

// Cache the runways data in memory (serverless cold start will refresh periodically)
let runwaysCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function loadRunwaysData() {
    const now = Date.now();

    // Return cached data if still valid
    if (runwaysCache && (now - cacheTimestamp) < CACHE_DURATION) {
        return runwaysCache;
    }

    // Fetch fresh data from OurAirports
    const response = await axios.get(
        'https://davidmegginson.github.io/ourairports-data/runways.csv',
        { responseType: 'text' }
    );

    // Parse CSV and build a map: airport_ident -> [runway identifiers]
    const lines = response.data.split('\n');
    const headers = lines[0].split(',');

    // Find column indices
    const airportIdentIdx = headers.indexOf('airport_ident');
    const leIdentIdx = headers.indexOf('le_ident');
    const heIdentIdx = headers.indexOf('he_ident');
    const closedIdx = headers.indexOf('closed');

    const runwayMap = {};

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV parse (handles basic cases - OurAirports data is clean)
        const cols = line.split(',');

        const airportIdent = cols[airportIdentIdx]?.replace(/"/g, '').trim();
        const leIdent = cols[leIdentIdx]?.replace(/"/g, '').trim();
        const heIdent = cols[heIdentIdx]?.replace(/"/g, '').trim();
        const closed = cols[closedIdx]?.replace(/"/g, '').trim();

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

    // Convert Sets to Arrays
    for (const key in runwayMap) {
        runwayMap[key] = Array.from(runwayMap[key]).sort((a, b) => {
            // Sort numerically by runway number
            const numA = parseInt(a.replace(/[LRC]/g, ''));
            const numB = parseInt(b.replace(/[LRC]/g, ''));
            return numA - numB;
        });
    }

    runwaysCache = runwayMap;
    cacheTimestamp = now;

    return runwayMap;
}

export default async function handler(req, res) {
    const { icao } = req.query;

    if (!icao) {
        return res.status(400).json({ error: 'ICAO code required' });
    }

    const airportCode = icao.toUpperCase();

    try {
        const runwayMap = await loadRunwaysData();
        const runways = runwayMap[airportCode] || [];

        return res.status(200).json({
            icao: airportCode,
            runways: runways
        });
    } catch (error) {
        console.error('Runway fetch error:', error.message);
        return res.status(500).json({ error: 'Failed to fetch runway data' });
    }
}
