import { ArrowUpRight } from 'lucide-react';
import type { WeatherWindow } from '../types/weather';

interface WeatherMetricsBarProps {
    window: WeatherWindow | null;
    stationElevation: number | undefined;
    className?: string;
}

export const WeatherMetricsBar = ({ window, stationElevation, className = '' }: WeatherMetricsBarProps) => {
    if (!window) return null;

    const { wind, visibility, altimeter, temperature } = window;

    // Calculate Density Altitude
    let daDisplay = '---';

    // Ensure we have all necessary data points
    if (stationElevation !== undefined && altimeter && temperature !== undefined) {
        const pressureAlt = stationElevation + (29.92 - altimeter) * 1000;
        const stdTemp = 15 - (2 * (stationElevation / 1000));
        const da = Math.round(pressureAlt + (120 * (temperature - stdTemp)));
        daDisplay = da.toLocaleString();
    }

    return (
        <div className={`flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16 ${className}`}>
            {/* Wind */}
            <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                    <span className="text-xs uppercase tracking-widest font-semibold text-slate-400">Wind</span>
                </div>
                <div className="flex items-baseline gap-1 text-slate-700 dark:text-slate-200">
                    <span className="text-2xl font-bold font-display">{wind.direction}°</span>
                    <span className="text-slate-400 text-lg">@</span>
                    <span className="text-2xl font-bold font-display">{wind.speed}</span>
                    <span className="text-sm font-medium text-slate-500 ml-0.5">kt</span>
                </div>
                {/* Wind Arrow Visual */}
                <div
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700"
                    style={{ transform: `rotate(${wind.direction - 45}deg)` }}
                >
                    <ArrowUpRight className="w-4 h-4 text-slate-900 dark:text-slate-100" />
                </div>
            </div>

            {/* Density Altitude */}
            <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-widest font-semibold text-slate-400">DA:</span>
                <span className="text-2xl font-bold text-slate-700 dark:text-slate-200 font-display">
                    {daDisplay} <span className="text-sm font-medium text-slate-500">ft</span>
                </span>
            </div>

            {/* Visibility */}
            <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-widest font-semibold text-slate-400">Vis:</span>
                <span className="text-2xl font-bold text-slate-700 dark:text-slate-200 font-display">
                    {visibility} <span className="text-sm font-medium text-slate-500">sm</span>
                </span>
            </div>
        </div>
    );
};
