import axios from 'axios';

export default async function handler(req, res) {
    // Extract the path (metar or taf) from the URL
    // We expect requests like /api/weather/metar?ids=... or /api/weather/taf?ids=...
    // Vercel handling: if this file is api/weather.js, it handles /api/weather
    // But we need to handle subpaths if we redirect strictly. 

    // STRATEGY: Update vercel.json to rewrite /api/weather/(.*) -> /api/weather?endpoint=$1

    const { endpoint } = req.query;

    if (!endpoint) {
        return res.status(400).json({ error: 'Endpoint required' });
    }

    // Construct target URL
    const targetUrl = `https://aviationweather.gov/api/data/${endpoint}`;

    // Remove 'endpoint' from query params to forward the rest
    const queryParams = { ...req.query };
    delete queryParams.endpoint;

    try {
        const response = await axios.get(targetUrl, {
            params: queryParams,
            headers: {
                'User-Agent': 'FlightSolo App (vercel-deployment)',
                'Accept': 'application/json'
            }
        });

        // Forward headers if needed, mainly CORS likely handled by Vercel but let's be safe
        // res.setHeader('Access-Control-Allow-Origin', '*'); 

        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Proxy Error:', error.message);
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        return res.status(500).json({ error: 'Failed to fetch data' });
    }
}
