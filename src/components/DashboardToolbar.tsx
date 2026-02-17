
import { useState, useRef } from 'react';
import { LayoutList, Calendar as CalendarIcon, Map, RefreshCw, ChevronDown, CheckSquare } from 'lucide-react';
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
    searchMode,
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
        <div className="flex flex-col xl:flex-row xl:items-center gap-4 w-full transition-colors">

            {/* Left Group: Search / Route Context */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Search / Route Input Container */}
                <div className="relative flex-1 max-w-md h-10">
                    {searchMode === 'single' ? (
                        <div className="h-full bg-white rounded-lg shadow-sm border border-slate-200 hover:border-slate-300 transition-colors flex items-center px-1 gap-2">
                            <div className="flex-1">
                                <AirportSearch
                                    currentStation={stationId}
                                    onSelect={setStationId}
                                />
                            </div>
                        </div>
                    ) : (
                        <div ref={routeSummaryRef} className="relative z-[50] h-full flex items-center">
                            {/* Route Mode Context */}
                            <div className="w-full h-full">
                                <RouteSummary
                                    route={route}
                                    onClick={() => setIsRouteEditorOpen(!isRouteEditorOpen)}
                                    isOpen={isRouteEditorOpen}
                                />
                            </div>

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

            {/* Right Group: Controls Loop */}
            <div className="flex flex-wrap items-center gap-3">

                {/* Aircraft Context */}
                <div className="h-10">
                    <AircraftSelector
                        fleet={fleet}
                        activeId={activeAircraftId}
                        onSelect={setActiveAircraftId}
                        onManage={() => setIsAircraftManagerOpen(true)}
                    />
                </div>

                {/* Profile Context */}
                <div className="relative h-10">
                    <select
                        className="h-full appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 text-sm font-medium text-slate-700 shadow-sm outline-none focus:border-sky-500 hover:border-slate-300 transition-all cursor-pointer min-w-[140px]"
                        value={activeProfileId}
                        onChange={(e) => setActiveProfileId(e.target.value)}
                    >
                        {profiles.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

                {/* Time Selector */}
                <div className="h-10 flex items-center bg-white border border-slate-200 rounded-lg px-3 shadow-sm hover:border-slate-300 transition-colors">
                    <input
                        type="datetime-local"
                        className="text-sm font-medium text-slate-700 bg-transparent outline-none border-none p-0 cursor-pointer"
                        value={formatDateTimeLocal(selectedTime || new Date())}
                        onChange={handleTimeChange}
                    />
                </div>

                {/* View Mode Segmented Control */}
                <div className="h-10 flex bg-slate-100 p-1 rounded-lg border border-slate-200/60 items-center">
                    {[
                        { id: 'timeline', icon: LayoutList, label: 'Overview' },
                        { id: 'calendar', icon: CalendarIcon, label: 'Calendar' },
                        { id: 'map', icon: Map, label: 'Map' },
                        { id: 'checklist', icon: CheckSquare, label: 'List' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setViewMode(item.id as any)}
                            className={clsx(
                                "h-full px-2.5 rounded-md transition-all flex items-center justify-center",
                                viewMode === item.id
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                            )}
                            title={item.label}
                        >
                            <item.icon className="w-4 h-4" />
                        </button>
                    ))}
                </div>

                {/* Refresh */}
                <button
                    onClick={onRefresh}
                    className="h-10 w-10 flex items-center justify-center bg-white border border-slate-200 text-slate-500 rounded-lg hover:text-sky-600 hover:border-sky-200 hover:shadow-sm transition-all"
                    title="Refresh Weather"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
