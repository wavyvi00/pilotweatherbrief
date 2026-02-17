import { ChevronDown, Plane } from 'lucide-react';
import type { Route } from '../types/route';
import { hasValidDestination } from '../types/route';

interface RouteSummaryProps {
    route: Route;
    onClick: () => void;
    isOpen: boolean;
}

/**
 * Compact route summary display for the toolbar
 * Shows: KGIF → KHOU or KGIF → KABC → KHOU
 * Click to open the full route editor popover
 */
export const RouteSummary = ({ route, onClick, isOpen }: RouteSummaryProps) => {
    const departure = route[0]?.icao || '???';
    const destination = route.length >= 2 ? route[route.length - 1]?.icao : null;

    // Get intermediate stops (everything except first and last)
    const stops = route.slice(1, -1).filter(wp => wp.icao);

    // Build display string
    const getRouteDisplay = () => {
        if (!hasValidDestination(route)) {
            return (
                <span className="text-slate-500 dark:text-slate-400 italic">
                    Tap to plan route...
                </span>
            );
        }

        return (
            <span className="flex items-center gap-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-200">{departure}</span>

                {stops.length > 0 ? (
                    <>
                        <span className="text-slate-400">→</span>
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                            {stops.length === 1 ? stops[0].icao : `${stops.length} stops`}
                        </span>
                    </>
                ) : null}

                <span className="text-slate-400">→</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                    {destination || '???'}
                </span>
            </span>
        );
    };

    return (
        <button
            onClick={onClick}
            className={`
                flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
                ${isOpen
                    ? 'bg-sky-50 dark:bg-sky-900/30 border-sky-300 dark:border-sky-700 ring-2 ring-sky-500/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600'
                }
            `}
        >
            <Plane className="w-4 h-4 text-sky-500" />
            <span className="text-sm">
                {getRouteDisplay()}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
    );
};
