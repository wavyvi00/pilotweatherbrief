export interface Metar {
    raw_text: string;
    station_id: string;
    observation_time: string;
    temp_c: number;
    dewpoint_c: number;
    wind_dir_degrees: number; // 0-360, or 0 for variable if wind_speed is 0
    wind_speed_kt: number;
    wind_gust_kt?: number;
    visibility_statute_mi: number;
    altim_in_hg: number;
    flight_category: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
    sky_condition: {
        sky_cover: string; // CLR, SKC, FEW, SCT, BKN, OVC
        cloud_base_ft_agl?: number;
    }[];
}

export interface Taf {
    raw_text: string;
    station_id: string;
    issue_time: string;
    bulletin_time: string;
    valid_time_from: string;
    valid_time_to: string;
    forecast: {
        fcst_time_from: string;
        fcst_time_to: string;
        wind_dir_degrees?: number;
        wind_speed_kt?: number;
        wind_gust_kt?: number;
        visibility_statute_mi?: number;
        sky_condition?: {
            sky_cover: string;
            cloud_base_ft_agl?: number;
        }[];
    }[];
}

// Normalized Data for App Consumption
export interface WeatherWindow {
    startTime: Date;
    endTime: Date;
    isForecast: boolean; // true if TAF/Model, false if METAR
    wind: {
        direction: number;
        speed: number;
        gust: number;
    };
    ceiling: number; // feet AGL, 99999 if clear
    visibility: number; // statute miles
    flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
    precipitationProbability: number; // 0-100
    source: 'METAR' | 'TAF' | 'MOS' | 'OPEN_METEO';
    rawText?: string;
}
