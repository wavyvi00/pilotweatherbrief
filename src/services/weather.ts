import axios from 'axios';
import type { Metar, Taf, WeatherWindow } from '../types/weather';
import { addHours, parseISO } from 'date-fns';

const BASE_URL = '/api/weather';

export const AviationWeatherService = {
    async getMetar(stationId: string): Promise<Metar | null> {
        try {
            const response = await axios.get(`${BASE_URL}/metar`, {
                params: {
                    ids: stationId,
                    format: 'json',
                    taf: false
                }
            });
            if (response.data && response.data.length > 0) {
                return this.mapRawToMetar(response.data[0]);
            }
            return null;
        } catch (error) {
            console.error('Failed to fetch METAR:', error);
            return null;
        }
    },

    async getMetars(stationIds: string[]): Promise<Metar[]> {
        if (stationIds.length === 0) return [];
        try {
            const response = await axios.get(`${BASE_URL}/metar`, {
                params: {
                    ids: stationIds.join(','),
                    format: 'json',
                    taf: false
                }
            });

            if (!Array.isArray(response.data)) return [];
            return response.data.map(this.mapRawToMetar).filter((m): m is Metar => m !== null);
        } catch (error) {
            console.error('Failed to fetch METARs:', error);
            return [];
        }
    },

    // Helper to map raw API fields to our internal Metar interface
    mapRawToMetar(raw: any): Metar {
        // Handle Cloud Layers
        const sky_condition = (raw.clouds || []).map((c: any) => ({
            sky_cover: c.cover,
            cloud_base_ft_agl: c.base
        }));

        return {
            raw_text: raw.rawOb || raw.raw_text || '',
            station_id: raw.icaoId || raw.station_id || 'UNKNOWN',
            observation_time: raw.reportTime || raw.observation_time || new Date().toISOString(),
            temp_c: raw.temp,
            dewpoint_c: raw.dewp,
            wind_dir_degrees: raw.wdir,
            wind_speed_kt: raw.wspd,
            wind_gust_kt: raw.wgst,
            visibility_statute_mi: raw.visib === '+' ? 10 : parseFloat(raw.visib || '10'), // Handle '10+' or similar strings if needed
            altim_in_hg: raw.altim,
            flight_category: raw.flightCategory || 'VFR', // API might not verify this, we calc on front end anyway? But mapping if present.
            sky_condition
        } as Metar;
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
                return this.mapRawToTaf(response.data[0]);
            }
            return null;
        } catch (error) {
            console.error('Failed to fetch TAF:', error);
            return null;
        }
    },

    async getTafs(stationIds: string[]): Promise<Taf[]> {
        if (stationIds.length === 0) return [];
        try {
            const response = await axios.get(`${BASE_URL}/taf`, {
                params: {
                    ids: stationIds.join(','),
                    format: 'json'
                }
            });
            if (!Array.isArray(response.data)) return [];
            return response.data.map(this.mapRawToTaf).filter((t): t is Taf => t !== null);
        } catch (error) {
            console.error('Failed to fetch TAFs:', error);
            return [];
        }
    },

    mapRawToTaf(raw: any): Taf {
        return {
            station_id: raw.icaoId || raw.station_id || 'UNKNOWN',
            raw_text: raw.rawTAF || raw.raw_text || '',
            issue_time: raw.issueTime || raw.issue_time || new Date().toISOString(),
            bulletin_time: raw.bulletinTime || raw.bulletin_time || new Date().toISOString(),
            valid_time_from: raw.validTimeFrom || raw.valid_time_from || new Date().toISOString(),
            valid_time_to: raw.validTimeTo || raw.valid_time_to || new Date().toISOString(),
            forecast: (raw.fcsts || []).map((f: any) => ({
                fcst_time_from: (typeof f.timeFrom === 'string' && f.timeFrom) ? f.timeFrom : new Date().toISOString(),
                fcst_time_to: (typeof f.timeTo === 'string' && f.timeTo) ? f.timeTo : new Date().toISOString(),
                wind_dir_degrees: f.wdir,
                wind_speed_kt: f.wspd,
                wind_gust_kt: f.wgst,
                visibility_statute_mi: f.visib === '+' ? 10 : parseFloat(f.visib || '10'),
                sky_condition: (f.clouds || []).map((c: any) => ({
                    sky_cover: c.cover,
                    cloud_base_ft_agl: c.base
                }))
            }))
        } as Taf;
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

        if (!metar) {
            console.error('[Weather] normalizeMetar called with null');
            return null as any; // Safe fallback logic handled by caller usually
        }

        const validTime = typeof metar.observation_time === 'string' ? metar.observation_time : new Date().toISOString();

        return {
            startTime: parseISO(validTime),
            endTime: addHours(parseISO(validTime), 1),
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

            // Defensive date parsing
            const startTimeStr = typeof block.fcst_time_from === 'string' ? block.fcst_time_from : new Date().toISOString();
            const endTimeStr = typeof block.fcst_time_to === 'string' ? block.fcst_time_to : new Date().toISOString();

            return {
                startTime: parseISO(startTimeStr),
                endTime: parseISO(endTimeStr),
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
