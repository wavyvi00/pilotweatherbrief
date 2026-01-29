
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_URL = 'https://raw.githubusercontent.com/mwgg/Airports/master/airports.json';
const TARGET_FILE = path.join(__dirname, '../src/data/airports.ts');

console.log(`Fetching from ${DATA_URL}...`);

https.get(DATA_URL, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            console.log('Parsing JSON...');
            const airports = JSON.parse(data);
            const usAirports = [];

            console.log('Filtering US Airports...');
            for (const key in airports) {
                const airport = airports[key];
                // Filter for United States
                if (airport.country === 'US') {
                    // Filter for 4-character ICAO codes starting with K (Mainland), P (Alaska/Hawaii), T (Territories)
                    // This generally filters out small private strips (e.g. 00AK) while keeping all weather-reporting stations.
                    // Also ensure it has lat/lon
                    if (airport.icao && /^[KPT][A-Z0-9]{3}$/.test(airport.icao) && airport.lat && airport.lon) {
                        usAirports.push({
                            icao: airport.icao,
                            name: airport.name,
                            city: airport.city,
                            state: airport.state, // might need abbreviation mapping if full name used
                            lat: parseFloat(airport.lat),
                            lon: parseFloat(airport.lon)
                        });
                    }
                }
            }

            console.log(`Found ${usAirports.length} valid US airports.`);

            // Sort by ICAO
            usAirports.sort((a, b) => a.icao.localeCompare(b.icao));

            // Create TS Content
            const fileContent = `export interface Airport {
    icao: string;
    name: string;
    city: string;
    state: string;
    lat: number;
    lon: number;
}

export const AIRPORTS: Airport[] = ${JSON.stringify(usAirports, null, 4)};
`;

            fs.writeFileSync(TARGET_FILE, fileContent);
            console.log(`Successfully wrote to ${TARGET_FILE} (${(fileContent.length / 1024 / 1024).toFixed(2)} MB)`);

        } catch (e) {
            console.error('Error parsing/writing:', e);
        }
    });

}).on('error', (err) => {
    console.error('Download error:', err);
});
