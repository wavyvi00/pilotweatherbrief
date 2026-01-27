import axios from 'axios';
import type { WeatherWindow } from '../types/weather';
import { addHours, parseISO } from 'date-fns';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export const OpenMeteoService = {
    async getForecast(lat: number, lon: number): Promise<WeatherWindow[]> {
        try {
            // Fetching: temperature, wind, visibility, cloud_cover, precipitation_probability
            // Note: Open-Meteo visibility is in meters. We need miles.
            // Cloud cover low/mid/high to infer ceiling is complex, using generic cloud cover for now as visual proxy.
            const response = await axios.get(BASE_URL, {
                params: {
                    latitude: lat,
                    longitude: lon,
                    hourly: 'temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility,cloud_cover_low,precipitation_probability',
                    wind_speed_unit: 'kn', // Aviation uses knots
                    forecast_days: 14
                }
            });

            const hourly = response.data.hourly;
            const windows: WeatherWindow[] = [];

            for (let i = 0; i < hourly.time.length; i++) {
                const time = hourly.time[i];
                const visMeters = hourly.visibility[i];
                const visMiles = visMeters / 1609.34;

                // Approximate flight category from Cloud Cover Low & Visibility
                // OpenMeteo Low Cloud is % (0-100). If > 50% (Broken/Overcast) and Low, we assume ceiling exists.
                // We lack exact height of low clouds easily, but generic Low is < 2km (~6000ft).
                // This is a rough heuristic for long range.

                const lowCloudPct = hourly.cloud_cover_low[i];
                // Heuristic: heavy low cloud = potential ceiling. 
                // We can't know exact LIFR/IFR without height, but we can guess MVFR if low clouds are dense.

                let flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR' = 'VFR';
                if (visMiles < 1) flightCategory = 'LIFR';
                else if (visMiles < 3) flightCategory = 'IFR';
                else if (visMiles <= 5) flightCategory = 'MVFR';
                else if (lowCloudPct > 80) flightCategory = 'MVFR'; // Pessimistic assumption for planning

                // We don't have exact ceiling feet, so we use a sentinel or estimation
                // 99999 = Clear. API gives % coverage.
                const ceiling = lowCloudPct > 50 ? 3000 : 99999; // Dummy value: if >50% low clouds, assume 3000ft ceiling for MVFR flagging

                windows.push({
                    startTime: parseISO(time),
                    endTime: addHours(parseISO(time), 1),
                    isForecast: true,
                    wind: {
                        direction: hourly.wind_direction_10m[i],
                        speed: hourly.wind_speed_10m[i],
                        gust: hourly.wind_gusts_10m[i]
                    },
                    ceiling,
                    visibility: visMiles,
                    flightCategory,
                    precipitationProbability: hourly.precipitation_probability[i],
                    source: 'OPEN_METEO'
                });
            }

            return windows;
        } catch (error) {
            console.error('Failed to fetch Open-Meteo forecast:', error);
            return [];
        }
    }
};
