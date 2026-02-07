import { SuitabilityCard } from './SuitabilityCard';
import { RunwayWindCalculator } from './RunwayWindCalculator';
import { ScoringEngine } from '../logic/scoring';
import type { WeatherWindow } from '../types/weather';
import type { TrainingProfile } from '../types/profile';
import type { Aircraft } from '../types/aircraft';
import { Plane, MapPin } from 'lucide-react';

interface AirportWeatherPanelProps {
    stationId: string;
    weatherData: WeatherWindow[];
    profile: TrainingProfile;
    label?: 'Departure' | 'Destination';
    selectedTime?: Date | null;
    compact?: boolean; // When true, skip header (header rendered externally)
    aircraft?: Aircraft;
}

export const AirportWeatherPanel = ({
    stationId,
    weatherData,
    profile,
    label,
    selectedTime,
    compact = false,
    aircraft
}: AirportWeatherPanelProps) => {
    // Find the current weather window based on selected time
    const getCurrentWindow = () => {
        if (!weatherData.length) return null;

        if (!selectedTime) {
            return weatherData[0]; // LIVE mode - use first/current window
        }

        // Find matching window for selected time
        const matching = weatherData.find(w => {
            const windowEnd = new Date(w.startTime.getTime() + 60 * 60 * 1000);
            return selectedTime >= w.startTime && selectedTime < windowEnd;
        });

        if (matching) return matching;

        // Find closest window
        return weatherData.reduce((prev, curr) => {
            const prevDiff = Math.abs(prev.startTime.getTime() - selectedTime.getTime());
            const currDiff = Math.abs(curr.startTime.getTime() - selectedTime.getTime());
            return currDiff < prevDiff ? curr : prev;
        });
    };

    const currentWindow = getCurrentWindow();
    const result = currentWindow ? ScoringEngine.calculateSuitability(currentWindow, profile, { aircraft }) : null;

    const isDeparture = label === 'Departure';

    return (
        <div className={compact ? '' : 'space-y-4'}>
            {/* Airport Header - only show if not compact */}
            {!compact && label && (
                <div className={`flex items-center gap-3 p-3 rounded-lg border ${isDeparture
                    ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800'
                    : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                    }`}>
                    {isDeparture ? (
                        <Plane className="w-5 h-5 text-sky-500" />
                    ) : (
                        <MapPin className="w-5 h-5 text-emerald-500" />
                    )}
                    <div>
                        <p className={`text-[10px] uppercase font-bold tracking-wider ${isDeparture ? 'text-sky-600 dark:text-sky-400' : 'text-emerald-600 dark:text-emerald-400'
                            }`}>
                            {label}
                        </p>
                        <p className="text-xl font-bold text-slate-800 dark:text-slate-200 font-display">
                            {stationId}
                        </p>
                    </div>
                </div>
            )}

            {/* Weather Content */}
            {currentWindow && result ? (
                <div className={compact ? 'space-y-3' : ''}>
                    <SuitabilityCard result={result} compact={compact} />
                    <RunwayWindCalculator wind={currentWindow.wind} stationId={stationId} compact={compact} />
                </div>
            ) : (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                    <p className="text-sm">Loading weather data...</p>
                </div>
            )}
        </div>
    );
};
