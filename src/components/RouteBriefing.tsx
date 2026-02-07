
import { useEffect, useState } from 'react';
import { addMinutes, format } from 'date-fns';
import { AIRPORTS } from '../data/airports';
import { calculateDistance, calculateETE, formatDuration } from '../services/geo';
import { AviationWeatherService } from '../services/weather';
import { ScoringEngine } from '../logic/scoring';
import type { TrainingProfile } from '../types/profile';
import type { WeatherWindow } from '../types/weather';
import type { Aircraft } from '../types/aircraft';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface RouteBriefingProps {
    from: string;
    to: string;
    profile: TrainingProfile; // Still needed for scoring
    aircraft: Aircraft; // New: For Speed/Fuel
}

export const RouteBriefing = ({ from, to, profile, aircraft }: RouteBriefingProps) => {
    const [stats, setStats] = useState<{ dist: number, ete: number, eta: Date } | null>(null);
    const [destWeather, setDestWeather] = useState<{ status: 'green' | 'yellow' | 'red', window: WeatherWindow } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const origin = AIRPORTS.find(a => a.icao === from);
        const dest = AIRPORTS.find(a => a.icao === to);

        if (!origin || !dest || !profile.aircraft) return;

        // 1. Calc Geo Stats
        const dist = calculateDistance(origin.lat, origin.lon, dest.lat, dest.lon);
        const speed = aircraft.performance.cruiseSpeed || 100; // Fallback
        const eteHours = calculateETE(dist, speed);
        const eta = addMinutes(new Date(), eteHours * 60);

        setStats({ dist, ete: eteHours, eta });
        setLoading(true);

        // 2. Fetch Dest Forecast logic
        const fetchForecast = async () => {
            // Fetch TAF
            const taf = await AviationWeatherService.getTaf(to);
            let bestWindow: WeatherWindow | null = null;

            if (taf) {
                const windows = AviationWeatherService.normalizeTaf(taf);
                // Find window covering ETA
                bestWindow = windows.find(w => eta >= w.startTime && eta < w.endTime) || null;
            }

            // Fallback to METAR if TAF/ETA is too soon or missing?
            // Actually if ETA is < 1 hour, METAR is better, but TAF is safer for planning.
            // Let's assume TAF. If no TAF, maybe MOS? For now "No Data".

            if (bestWindow) {
                const suitability = ScoringEngine.calculateSuitability(bestWindow, profile, { aircraft });
                let color: 'green' | 'yellow' | 'red' = 'green';
                if (suitability.status === 'NO_GO') color = 'red';
                if (suitability.status === 'MARGINAL') color = 'yellow';

                setDestWeather({
                    status: color,
                    window: bestWindow
                });
            } else {
                setDestWeather(null);
            }
            setLoading(false);
        };

        fetchForecast();

    }, [from, to, profile, aircraft]);

    if (!stats) return null;

    return (
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">

                {/* Distance */}
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Distance</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-slate-800">{stats.dist}</span>
                        <span className="text-xs font-bold text-slate-500">NM</span>
                    </div>
                </div>

                {/* ETE */}
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Est. Time Enroute</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-slate-800">{formatDuration(stats.ete)}</span>
                    </div>
                </div>

                {/* ETA */}
                <div className="flex flex-col border-l border-slate-100 pl-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Arrival (ETA)</span>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-sky-500" />
                        <span className="text-xl font-bold text-slate-900">{format(stats.eta, 'HH:mm')}</span>
                        <span className="text-xs font-medium text-slate-400">Local</span>
                    </div>
                </div>

                {/* Forecast Status */}
                <div className="flex flex-col border-l border-slate-100 pl-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Forecast @ Arrival</span>
                    {loading ? (
                        <span className="text-xs text-slate-400 animate-pulse">Checking...</span>
                    ) : destWeather ? (
                        <div className={`flex items-center gap-2 font-bold ${destWeather.status === 'green' ? 'text-emerald-600' :
                            destWeather.status === 'red' ? 'text-rose-600' : 'text-amber-500'
                            }`}>
                            {destWeather.status === 'green' && <CheckCircle className="w-5 h-5" />}
                            {destWeather.status === 'red' && <XCircle className="w-5 h-5" />}
                            {destWeather.status === 'yellow' && <AlertTriangle className="w-5 h-5" />}
                            <span>{destWeather.status === 'green' ? 'VFR / GO' : 'NO-GO / RISK'}</span>
                        </div>
                    ) : (
                        <span className="text-xs text-slate-400">No Forecast Data</span>
                    )}
                </div>

            </div>

            {/* Weather Details details (Optional expansion) */}
            {destWeather?.window && destWeather.status !== 'green' && (
                <div className="bg-rose-50 px-4 py-2 border-t border-rose-100 flex items-center gap-2 text-xs text-rose-800">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="font-bold">Hazard:</span>
                    <span>Ceiling {destWeather.window.ceiling}ft, Vis {destWeather.window.visibility}sm (Flight Cat: {destWeather.window.flightCategory})</span>
                </div>
            )}
        </div>
    );
};
