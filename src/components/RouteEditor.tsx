import { Plus, X, Plane, MapPin, Flag } from 'lucide-react';
import { AirportSearch } from './AirportSearch';
import type { Route } from '../types/route';
import { addWaypoint, removeWaypoint, updateWaypoint } from '../types/route';

interface RouteEditorProps {
    route: Route;
    onRouteChange: (route: Route) => void;
    compact?: boolean;
}

export const RouteEditor = ({ route, onRouteChange, compact = false }: RouteEditorProps) => {
    const handleUpdateWaypoint = (index: number, icao: string) => {
        onRouteChange(updateWaypoint(route, index, icao));
    };

    const handleAddWaypoint = () => {
        onRouteChange(addWaypoint(route, ''));
    };

    const handleRemoveWaypoint = (index: number) => {
        onRouteChange(removeWaypoint(route, index));
    };

    // Ensure we always have at least departure and destination slots
    const hasDestination = route.length >= 2;

    if (compact) {
        // Compact horizontal layout for toolbar
        return (
            <div className="flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/30 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 w-full overflow-x-auto">
                {route.map((waypoint, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                        {index > 0 && (
                            <div className="text-slate-300 dark:text-slate-600 text-xs font-bold">→</div>
                        )}
                        <div className="relative flex items-center gap-1">
                            {/* Waypoint type indicator */}
                            <div className={`p-1 rounded ${waypoint.type === 'departure' ? 'bg-sky-100 dark:bg-sky-900/30' :
                                    waypoint.type === 'destination' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                                        'bg-amber-100 dark:bg-amber-900/30'
                                }`}>
                                {waypoint.type === 'departure' && <Plane className="w-3 h-3 text-sky-500" />}
                                {waypoint.type === 'waypoint' && <MapPin className="w-3 h-3 text-amber-500" />}
                                {waypoint.type === 'destination' && <Flag className="w-3 h-3 text-emerald-500" />}
                            </div>

                            {/* Airport search input */}
                            <div className="min-w-[90px]">
                                <AirportSearch
                                    currentStation={waypoint.icao}
                                    onSelect={(icao) => handleUpdateWaypoint(index, icao)}
                                    compact
                                />
                            </div>

                            {/* Remove button (only for waypoints, not departure/destination) */}
                            {waypoint.type === 'waypoint' && (
                                <button
                                    onClick={() => handleRemoveWaypoint(index)}
                                    className="p-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 transition-colors"
                                    title="Remove waypoint"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {/* Add destination if missing */}
                {!hasDestination && (
                    <>
                        <div className="text-slate-300 dark:text-slate-600 text-xs font-bold">→</div>
                        <div className="relative flex items-center gap-1">
                            <div className="p-1 rounded bg-emerald-100 dark:bg-emerald-900/30">
                                <Flag className="w-3 h-3 text-emerald-500" />
                            </div>
                            <div className="min-w-[90px]">
                                <AirportSearch
                                    currentStation=""
                                    onSelect={(icao) => onRouteChange([...route, { icao, type: 'destination' }])}
                                    compact
                                    placeholder="Destination"
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* Add waypoint button */}
                {hasDestination && (
                    <button
                        onClick={handleAddWaypoint}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-sky-100 hover:text-sky-600 dark:hover:bg-sky-900/30 dark:hover:text-sky-400 text-xs font-medium transition-colors whitespace-nowrap"
                        title="Add intermediate waypoint"
                    >
                        <Plus className="w-3 h-3" />
                        <span className="hidden sm:inline">Stop</span>
                    </button>
                )}
            </div>
        );
    }

    // Full vertical layout (for modal or expanded view)
    return (
        <div className="space-y-3">
            {route.map((waypoint, index) => (
                <div key={index} className="flex items-center gap-3">
                    {/* Connection line */}
                    {index > 0 && (
                        <div className="absolute left-5 -mt-3 w-0.5 h-3 bg-slate-200 dark:bg-slate-700" />
                    )}

                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${waypoint.type === 'departure' ? 'bg-sky-100 dark:bg-sky-900/30' :
                            waypoint.type === 'destination' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                                'bg-amber-100 dark:bg-amber-900/30'
                        }`}>
                        {waypoint.type === 'departure' && <Plane className="w-5 h-5 text-sky-500" />}
                        {waypoint.type === 'waypoint' && <MapPin className="w-5 h-5 text-amber-500" />}
                        {waypoint.type === 'destination' && <Flag className="w-5 h-5 text-emerald-500" />}
                    </div>

                    {/* Label and Input */}
                    <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-0.5 block">
                            {waypoint.type === 'departure' ? 'Departure' :
                                waypoint.type === 'destination' ? 'Destination' :
                                    `Stop ${index}`}
                        </label>
                        <AirportSearch
                            currentStation={waypoint.icao}
                            onSelect={(icao) => handleUpdateWaypoint(index, icao)}
                        />
                    </div>

                    {/* Remove button */}
                    {waypoint.type === 'waypoint' && (
                        <button
                            onClick={() => handleRemoveWaypoint(index)}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))}

            {/* Add waypoint button */}
            {hasDestination && (
                <button
                    onClick={handleAddWaypoint}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-sky-300 hover:text-sky-500 dark:hover:border-sky-700 dark:hover:text-sky-400 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Add Stop</span>
                </button>
            )}
        </div>
    );
};
