
import { LayoutList, Calendar as CalendarIcon, Map, RefreshCw, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { AirportSearch } from './AirportSearch';
import { AircraftSelector } from './AircraftSelector';
import type { Aircraft } from '../types/aircraft';
import type { TrainingProfile } from '../types/profile';

interface DashboardToolbarProps {
    searchMode: 'single' | 'route';
    setSearchMode: (mode: 'single' | 'route') => void;
    stationId: string;
    setStationId: (id: string) => void;
    route: { from: string; to: string | null };
    setRoute: (route: { from: string; to: string | null }) => void;
    fleet: Aircraft[];
    activeAircraftId: string;
    setActiveAircraftId: (id: string) => void;
    setIsAircraftManagerOpen: (open: boolean) => void;
    profiles: TrainingProfile[];
    activeProfileId: string;
    setActiveProfileId: (id: string) => void;
    viewMode: 'calendar' | 'timeline' | 'map';
    setViewMode: (mode: 'calendar' | 'timeline' | 'map') => void;
    onRefresh: () => void;
}

export const DashboardToolbar = ({
    searchMode, setSearchMode,
    stationId, setStationId,
    route, setRoute,
    fleet, activeAircraftId, setActiveAircraftId, setIsAircraftManagerOpen,
    profiles, activeProfileId, setActiveProfileId,
    viewMode, setViewMode,
    onRefresh
}: DashboardToolbarProps) => {

    return (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 p-2 flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full">

            {/* Group 1: Navigation & Search */}
            <div className="flex items-center gap-3 w-full lg:w-auto flex-1">
                {/* Mode Switcher */}
                <div className="flex bg-slate-100/80 p-1 rounded-lg border border-slate-200 shrink-0">
                    <button
                        onClick={() => setSearchMode('single')}
                        className={clsx("px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                            searchMode === 'single' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
                    >
                        Single
                    </button>
                    <button
                        onClick={() => setSearchMode('route')}
                        className={clsx("px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                            searchMode === 'route' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
                    >
                        Route
                    </button>
                </div>

                {/* Search Bar(s) */}
                <div className="flex-1 max-w-md">
                    {searchMode === 'single' ? (
                        <div className="w-full">
                            <AirportSearch
                                currentStation={stationId}
                                onSelect={setStationId}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 bg-slate-50/50 p-1 rounded-lg border border-slate-200 w-full">
                            <div className="relative flex-1 min-w-[80px]">
                                <span className="absolute left-2 top-2.5 text-[10px] font-bold text-slate-400">FROM</span>
                                <AirportSearch
                                    currentStation={route.from}
                                    onSelect={(icao) => {
                                        setRoute({ ...route, from: icao });
                                        setStationId(icao);
                                    }}
                                    compact
                                />
                            </div>
                            <div className="text-slate-300">→</div>
                            <div className="relative flex-1 min-w-[80px]">
                                <span className="absolute left-2 top-2.5 text-[10px] font-bold text-slate-400">TO</span>
                                <AirportSearch
                                    currentStation={route.to || ''}
                                    onSelect={(icao) => setRoute({ ...route, to: icao })}
                                    compact
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Separator (Desktop) */}
            <div className="hidden lg:block w-px h-8 bg-slate-200"></div>

            {/* Group 2: Configuration (Aircraft / Profile) */}
            <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
                {/* Aircraft */}
                <div className="min-w-[200px]">
                    <AircraftSelector
                        fleet={fleet}
                        activeId={activeAircraftId}
                        onSelect={setActiveAircraftId}
                        onManage={() => setIsAircraftManagerOpen(true)}
                    />
                </div>

                {/* Profile */}
                <div className="relative min-w-[180px]">
                    <select
                        className="w-full appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-sm font-bold text-slate-700 shadow-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 cursor-pointer hover:border-slate-300 transition-all"
                        value={activeProfileId}
                        onChange={(e) => setActiveProfileId(e.target.value)}
                    >
                        {profiles.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
            </div>

            {/* Group 3: View Toggles & Actions */}
            <div className="flex items-center gap-2 ml-auto shrink-0">
                <div className="flex bg-slate-100/80 p-1 rounded-lg border border-slate-200">
                    <button
                        onClick={() => setViewMode('timeline')}
                        className={clsx("p-2 rounded-md transition-all flex items-center justify-center",
                            viewMode === 'timeline' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-400 hover:text-slate-600')}
                        title="Timeline View"
                    >
                        <LayoutList className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={clsx("p-2 rounded-md transition-all flex items-center justify-center",
                            viewMode === 'calendar' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-400 hover:text-slate-600')}
                        title="Calendar View"
                    >
                        <CalendarIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={clsx("p-2 rounded-md transition-all flex items-center justify-center",
                            viewMode === 'map' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-400 hover:text-slate-600')}
                        title="Map View"
                    >
                        <Map className="w-4 h-4" />
                    </button>
                </div>

                <button
                    onClick={onRefresh}
                    className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-sky-500 hover:border-sky-200 transition-all shadow-sm"
                    title="Refresh Weather"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
