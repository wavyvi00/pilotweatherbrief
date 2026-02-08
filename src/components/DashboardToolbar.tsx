
import { useState, useRef } from 'react';
import { LayoutList, Calendar as CalendarIcon, Map, RefreshCw, ChevronDown, Scale, CheckSquare } from 'lucide-react';
import clsx from 'clsx';
import { AirportSearch } from './AirportSearch';
import { AircraftSelector } from './AircraftSelector';
import { RouteSummary } from './RouteSummary';
import { RouteEditorPopover } from './RouteEditorPopover';
import type { Aircraft } from '../types/aircraft';
import type { TrainingProfile } from '../types/profile';
import type { Route } from '../types/route';

interface DashboardToolbarProps {
    searchMode: 'single' | 'route';
    setSearchMode: (mode: 'single' | 'route') => void;
    stationId: string;
    setStationId: (id: string) => void;
    route: Route;
    setRoute: (route: Route) => void;
    fleet: Aircraft[];
    activeAircraftId: string;
    setActiveAircraftId: (id: string) => void;
    setIsAircraftManagerOpen: (open: boolean) => void;
    profiles: TrainingProfile[];
    activeProfileId: string;
    setActiveProfileId: (id: string) => void;
    viewMode: 'calendar' | 'timeline' | 'map' | 'wb' | 'checklist';
    setViewMode: (mode: 'calendar' | 'timeline' | 'map' | 'wb' | 'checklist') => void;
    selectedTime: Date | null;
    onTimeChange: (time: Date | null) => void;
    onRefresh: () => void;
}

export const DashboardToolbar = ({
    searchMode, setSearchMode,
    stationId, setStationId,
    route, setRoute,
    fleet, activeAircraftId, setActiveAircraftId, setIsAircraftManagerOpen,
    profiles, activeProfileId, setActiveProfileId,
    viewMode, setViewMode,
    selectedTime, onTimeChange,
    onRefresh
}: DashboardToolbarProps) => {

    const [isRouteEditorOpen, setIsRouteEditorOpen] = useState(false);
    const routeSummaryRef = useRef<HTMLDivElement>(null);

    // Helper to format Date to datetime-local input value
    const formatDateTimeLocal = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value) {
            onTimeChange(new Date(value));
        } else {
            onTimeChange(null);
        }
    };

    const handleRouteChange = (newRoute: Route) => {
        setRoute(newRoute);
        // Keep stationId in sync with departure
        if (newRoute[0]?.icao) {
            setStationId(newRoute[0].icao);
        }
    };

    return (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-2 sm:p-3 w-full transition-colors">
            {/* Mobile: Stack in rows, Desktop: Single flex row */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3">

                {/* Row 1: Mode + Search */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Mode Switcher */}
                    <div className="flex bg-slate-100/80 dark:bg-slate-900/50 p-0.5 sm:p-1 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                        <button
                            onClick={() => setSearchMode('single')}
                            className={clsx("px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs font-bold transition-all",
                                searchMode === 'single' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200')}
                        >
                            Single
                        </button>
                        <button
                            onClick={() => setSearchMode('route')}
                            className={clsx("px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs font-bold transition-all",
                                searchMode === 'route' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200')}
                        >
                            Route
                        </button>
                    </div>

                    {/* Search Bar / Route Summary */}
                    <div className="relative flex-1 min-w-[120px]">
                        {searchMode === 'single' ? (
                            <AirportSearch
                                currentStation={stationId}
                                onSelect={setStationId}
                            />
                        ) : (
                            <div ref={routeSummaryRef} className="relative z-[1000]">
                                <RouteSummary
                                    route={route}
                                    onClick={() => setIsRouteEditorOpen(!isRouteEditorOpen)}
                                    isOpen={isRouteEditorOpen}
                                />
                                <RouteEditorPopover
                                    route={route}
                                    onRouteChange={handleRouteChange}
                                    isOpen={isRouteEditorOpen}
                                    onClose={() => setIsRouteEditorOpen(false)}
                                    anchorRef={routeSummaryRef}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Row 2: Aircraft + Profile + View Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Aircraft Selector */}
                    <div className="shrink-0">
                        <AircraftSelector
                            fleet={fleet}
                            activeId={activeAircraftId}
                            onSelect={setActiveAircraftId}
                            onManage={() => setIsAircraftManagerOpen(true)}
                        />
                    </div>

                    {/* Profile Selector - Compact on mobile */}
                    <div className="relative shrink-0">
                        <select
                            className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-2 sm:pl-3 pr-6 sm:pr-8 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-all max-w-[140px] sm:max-w-none truncate"
                            value={activeProfileId}
                            onChange={(e) => setActiveProfileId(e.target.value)}
                        >
                            {profiles.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Separator (Desktop only) */}
                    <div className="hidden lg:block w-px h-6 bg-slate-200 dark:bg-slate-700"></div>

                    {/* View Toggles + Refresh - Pushed to right on desktop */}
                    <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
                        {/* Date Picker - Desktop only */}
                        <div className="hidden md:flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 shadow-sm">
                            <input
                                type="datetime-local"
                                className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-transparent outline-none border-none p-0 cursor-pointer w-full"
                                value={formatDateTimeLocal(selectedTime || new Date())}
                                onChange={handleTimeChange}
                            />
                        </div>

                        {/* View Toggles */}
                        <div className="flex bg-slate-100/80 dark:bg-slate-900/50 p-0.5 sm:p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => setViewMode('timeline')}
                                className={clsx("p-1.5 sm:p-2 rounded-md transition-all flex items-center justify-center",
                                    viewMode === 'timeline' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300')}
                                title="Timeline View"
                            >
                                <LayoutList className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={clsx("p-1.5 sm:p-2 rounded-md transition-all flex items-center justify-center",
                                    viewMode === 'calendar' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300')}
                                title="Calendar View"
                            >
                                <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={clsx("p-1.5 sm:p-2 rounded-md transition-all flex items-center justify-center",
                                    viewMode === 'map' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300')}
                                title="Map View"
                            >
                                <Map className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('wb')}
                                className={clsx("p-1.5 sm:p-2 rounded-md transition-all flex items-center justify-center",
                                    viewMode === 'wb' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300')}
                                title="Weight & Balance"
                            >
                                <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('checklist')}
                                className={clsx("p-1.5 sm:p-2 rounded-md transition-all flex items-center justify-center",
                                    viewMode === 'checklist' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300')}
                                title="Checklists"
                            >
                                <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={onRefresh}
                            className="p-1.5 sm:p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-lg hover:text-sky-500 dark:hover:text-sky-400 hover:border-sky-200 dark:hover:border-sky-800 transition-all shadow-sm"
                            title="Refresh Weather"
                        >
                            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
