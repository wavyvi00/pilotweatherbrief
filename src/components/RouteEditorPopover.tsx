import { useRef, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plane, MapPin, Flag, Plus, Navigation, Fuel, CircleStop, PlayCircle, PlaneLanding } from 'lucide-react';
import { AirportSearch } from './AirportSearch';
import type { Route, StopType } from '../types/route';
import { addWaypoint, removeWaypoint, updateWaypoint, hasValidDestination, getRouteIcaos } from '../types/route';
import { AIRPORTS } from '../data/airports';
import { calculateDistance } from '../services/geo';

interface RouteEditorPopoverProps {
    route: Route;
    onRouteChange: (route: Route) => void;
    isOpen: boolean;
    onClose: () => void;
    anchorRef: React.RefObject<HTMLElement | null>;
}

// Stop type labels and icons
const STOP_TYPES: { value: StopType; label: string; shortLabel: string }[] = [
    { value: 'full-stop', label: 'Full Stop', shortLabel: 'Stop' },
    { value: 'fuel', label: 'Fuel Stop', shortLabel: 'Fuel' },
    { value: 'stop-and-go', label: 'Stop & Go', shortLabel: 'S&G' },
    { value: 'touch-and-go', label: 'Touch & Go', shortLabel: 'T&G' },
];

const getStopIcon = (stopType?: StopType) => {
    switch (stopType) {
        case 'fuel':
            return <Fuel className="w-5 h-5 text-amber-500" />;
        case 'stop-and-go':
            return <CircleStop className="w-5 h-5 text-amber-500" />;
        case 'touch-and-go':
            return <PlaneLanding className="w-5 h-5 text-amber-500" />;
        case 'full-stop':
        default:
            return <MapPin className="w-5 h-5 text-amber-500" />;
    }
};

export const RouteEditorPopover = ({
    route,
    onRouteChange,
    isOpen,
    onClose,
    anchorRef
}: RouteEditorPopoverProps) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    // Calculate position based on anchor element
    useEffect(() => {
        if (isOpen && anchorRef.current) {
            const rect = anchorRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 8, // 8px gap
                left: rect.left
            });
        }
    }, [isOpen, anchorRef]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                anchorRef.current &&
                !anchorRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, anchorRef]);

    // Close on Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Calculate total distance
    const totalDistance = useMemo(() => {
        const icaos = getRouteIcaos(route);
        if (icaos.length < 2) return 0;

        let total = 0;
        for (let i = 0; i < icaos.length - 1; i++) {
            const from = AIRPORTS.find(a => a.icao === icaos[i]);
            const to = AIRPORTS.find(a => a.icao === icaos[i + 1]);
            if (from && to) {
                total += calculateDistance(from.lat, from.lon, to.lat, to.lon);
            }
        }
        return Math.round(total);
    }, [route]);

    const handleUpdateWaypoint = (index: number, icao: string) => {
        onRouteChange(updateWaypoint(route, index, icao));
    };

    const handleUpdateStopType = (index: number, stopType: StopType) => {
        const newRoute = route.map((wp, i) =>
            i === index ? { ...wp, stopType } : wp
        );
        onRouteChange(newRoute);
    };

    const handleAddWaypoint = () => {
        onRouteChange(addWaypoint(route, ''));
    };

    const handleRemoveWaypoint = (index: number) => {
        onRouteChange(removeWaypoint(route, index));
    };

    // Ensure we always have at least departure and destination slots
    const hasDestination = route.length >= 2;

    if (!isOpen) return null;

    // Use portal to render at document body level
    return createPortal(
        <div
            ref={popoverRef}
            className="fixed w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-visible animate-fade-in"
            style={{
                top: position.top,
                left: position.left,
                zIndex: 99999 // Maximum z-index
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-sky-500" />
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Edit Route</span>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Waypoints */}
            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                {route.map((waypoint, index) => (
                    <div
                        key={index}
                        className="relative"
                        style={{ zIndex: 100 - index }} // Higher rows get higher z-index
                    >
                        {/* Connecting line */}
                        {index > 0 && (
                            <div className="absolute left-5 -top-3 w-0.5 h-3 bg-slate-200 dark:bg-slate-700" />
                        )}

                        <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${waypoint.type === 'departure' ? 'bg-sky-100 dark:bg-sky-900/30' :
                                waypoint.type === 'destination' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                                    'bg-amber-100 dark:bg-amber-900/30'
                                }`}>
                                {waypoint.type === 'departure' && <Plane className="w-5 h-5 text-sky-500" />}
                                {waypoint.type === 'waypoint' && getStopIcon(waypoint.stopType)}
                                {waypoint.type === 'destination' && <Flag className="w-5 h-5 text-emerald-500" />}
                            </div>

                            {/* Input */}
                            <div className="flex-1">
                                <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1 block">
                                    {waypoint.type === 'departure' ? 'Departure' :
                                        waypoint.type === 'destination' ? 'Destination' :
                                            STOP_TYPES.find(s => s.value === waypoint.stopType)?.label || 'Stop'}
                                </label>
                                <AirportSearch
                                    currentStation={waypoint.icao}
                                    onSelect={(icao) => handleUpdateWaypoint(index, icao)}
                                />
                                {/* Stop type selector for waypoints */}
                                {waypoint.type === 'waypoint' && (
                                    <select
                                        value={waypoint.stopType || 'full-stop'}
                                        onChange={(e) => handleUpdateStopType(index, e.target.value as StopType)}
                                        className="mt-1.5 w-full px-2 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                    >
                                        {STOP_TYPES.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Remove button (only for waypoints) */}
                            {waypoint.type === 'waypoint' && (
                                <button
                                    onClick={() => handleRemoveWaypoint(index)}
                                    className="mt-6 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                                    title="Remove stop"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {/* Add destination if missing */}
                {!hasDestination && (
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30">
                            <Flag className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1 block">
                                Destination
                            </label>
                            <AirportSearch
                                currentStation=""
                                onSelect={(icao) => onRouteChange([...route, { icao, type: 'destination' }])}
                                placeholder="Search destination..."
                            />
                        </div>
                    </div>
                )}

                {/* Add waypoint button */}
                {hasDestination && (
                    <button
                        onClick={handleAddWaypoint}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-amber-300 hover:text-amber-500 hover:bg-amber-50 dark:hover:border-amber-700 dark:hover:text-amber-400 dark:hover:bg-amber-900/10 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">Add Stop</span>
                    </button>
                )}
            </div>

            {/* Footer with stats */}
            {hasValidDestination(route) && (
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Total Distance</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{totalDistance} NM</span>
                    </div>
                    {route.length > 2 && (
                        <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-slate-500 dark:text-slate-400">Stops</span>
                            <span className="font-medium text-amber-600 dark:text-amber-400">{route.length - 2}</span>
                        </div>
                    )}
                </div>
            )}
        </div>,
        document.body
    );
};

