import axios from 'axios';
import type { Metar, Taf, WeatherWindow } from '../types/weather';
import { addHours, parseISO } from 'date-fns';

const BASE_URL = 'https://aviationweather.gov/api/data';

export const AviationWeatherService = {
    async getMetar(stationId: string): Promise<Metar | null> {
        try {
            const response = await axios.get(`${BASE_URL}/metar`, {
                params: {
                    ids: stationId,
                    format: 'json',
                    taf: false // Ensure we only get METAR
                }
            });
            if (response.data && response.data.length > 0) {
                return response.data[0];
            }
            return null;
        } catch (error) {
            console.error('Failed to fetch METAR:', error);
            return null;
        }
    },

    async getTaf(stationId: string): Promise<Taf | null> {
        try {
            const response = await axios.get(`${BASE_URL}/taf`, {
                params: {
                    ids: stationId,
                    format: 'json'
                }
            });
            if (response.data && response.data.length > 0) {
                return response.data[0];
            }
            return null;
        } catch (error) {
            console.error('Failed to fetch TAF:', error);
            return null;
        }
    },

    /**
     * Converts a METAR to a singular WeatherWindow (Current Conditions)
     */
    normalizeMetar(metar: Metar): WeatherWindow {
        // Determine ceiling (lowest broken or overcast layer)
        let ceiling = 99999;
        if (metar.sky_condition) {
            for (const layer of metar.sky_condition) {
                if ((layer.sky_cover === 'BKN' || layer.sky_cover === 'OVC') && layer.cloud_base_ft_agl) {
                    ceiling = Math.min(ceiling, layer.cloud_base_ft_agl);
                }
            }
        }

        return {
            startTime: parseISO(metar.observation_time),
            endTime: addHours(parseISO(metar.observation_time), 1),
            isForecast: false,
            wind: {
                direction: metar.wind_dir_degrees || 0,
                speed: metar.wind_speed_kt || 0,
                gust: metar.wind_gust_kt || 0
            },
            ceiling,
            visibility: metar.visibility_statute_mi || 10,
            flightCategory: metar.flight_category || 'VFR', // Fallback, normally provided
            precipitationProbability: 0, // METAR doesn't usually give prob, but we could parse distinct codes
            source: 'METAR'
        };
    },

    /**
     * Converts TAF to array of WeatherWindows
     */
    normalizeTaf(taf: Taf): WeatherWindow[] {
        if (!taf.forecast) return [];

        return taf.forecast.map(block => {
            // Determine ceiling
            let ceiling = 99999;
            if (block.sky_condition) {
                for (const layer of block.sky_condition) {
                    if ((layer.sky_cover === 'BKN' || layer.sky_cover === 'OVC') && layer.cloud_base_ft_agl) {
                        ceiling = Math.min(ceiling, layer.cloud_base_ft_agl);
                    }
                }
            }

            // Determine flight category based on ceiling/vis if not provided
            let flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR' = 'VFR';
            const vis = block.visibility_statute_mi ?? 10;

            if (ceiling < 500 || vis < 1) {
                flightCategory = 'LIFR';
            } else if (ceiling < 1000 || vis < 3) {
                flightCategory = 'IFR';
            } else if (ceiling <= 3000 || vis <= 5) {
                flightCategory = 'MVFR';
            }

            return {
                startTime: parseISO(block.fcst_time_from),
                endTime: parseISO(block.fcst_time_to),
                isForecast: true,
                wind: {
                    direction: block.wind_dir_degrees || 0,
                    speed: block.wind_speed_kt || 0,
                    gust: block.wind_gust_kt || 0
                },
                ceiling,
                visibility: vis,
                flightCategory,
                precipitationProbability: 0,
                source: 'TAF'
            };
        });
    }
};
