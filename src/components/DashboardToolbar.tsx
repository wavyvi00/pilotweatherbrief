
import { LayoutList, Calendar as CalendarIcon, Map, RefreshCw, ChevronDown, ArrowRight, Moon, Sun } from 'lucide-react';
import clsx from 'clsx';
import { AirportSearch } from './AirportSearch';
import { AircraftSelector } from './AircraftSelector';
import type { Aircraft } from '../types/aircraft';
import type { TrainingProfile } from '../types/profile';
import { useTheme } from '../hooks/useTheme';

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
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-2 flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full transition-colors">

            {/* Group 1: Navigation & Search */}
            <div className="flex items-center gap-3 w-full lg:w-auto flex-1">
                {/* Mode Switcher */}
                <div className="flex bg-slate-100/80 dark:bg-slate-900/50 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                    <button
                        onClick={() => setSearchMode('single')}
                        className={clsx("px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                            searchMode === 'single' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200')}
                    >
                        Single
                    </button>
                    <button
                        onClick={() => setSearchMode('route')}
                        className={clsx("px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                            searchMode === 'route' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200')}
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
                        <div className="flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/30 p-1 rounded-lg border border-slate-200 dark:border-slate-700 w-full">
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
                            <div className="text-slate-300 dark:text-slate-600"><ArrowRight className="w-4 h-4" /></div>
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
            <div className="hidden lg:block w-px h-8 bg-slate-200 dark:bg-slate-700"></div>

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
                        className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-all"
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
                <div className="flex bg-slate-100/80 dark:bg-slate-900/50 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setViewMode('timeline')}
                        className={clsx("p-2 rounded-md transition-all flex items-center justify-center",
                            viewMode === 'timeline' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300')}
                        title="Timeline View"
                    >
                        <LayoutList className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={clsx("p-2 rounded-md transition-all flex items-center justify-center",
                            viewMode === 'calendar' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300')}
                        title="Calendar View"
                    >
                        <CalendarIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={clsx("p-2 rounded-md transition-all flex items-center justify-center",
                            viewMode === 'map' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300')}
                        title="Map View"
                    >
                        <Map className="w-4 h-4" />
                    </button>
                </div>

                {/* Date Picker (Visual Only for now) */}
                <div className="hidden xl:flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 shadow-sm">
                    <input
                        type="datetime-local"
                        className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-transparent outline-none border-none p-0 cursor-pointer"
                        defaultValue={new Date().toISOString().slice(0, 16)}
                    // Functionality to be connected to global time context later
                    />
                </div>

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

                <button
                    onClick={onRefresh}
                    className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-lg hover:text-sky-500 dark:hover:text-sky-400 hover:border-sky-200 dark:hover:border-sky-800 transition-all shadow-sm"
                    title="Refresh Weather"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>

                <button
                    onClick={toggleTheme}
                    className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-lg hover:text-indigo-500 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all shadow-sm"
                    title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
};
