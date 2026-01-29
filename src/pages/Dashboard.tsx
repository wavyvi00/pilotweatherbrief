import { useState } from 'react';
import { useWeather } from '../hooks/useWeather';
import { RouteBriefing } from '../components/RouteBriefing';
import { useProfiles } from '../hooks/useProfiles';
import { useAircraft } from '../hooks/useAircraft';
import { AircraftManager } from '../components/AircraftManager';
import { ScoringEngine } from '../logic/scoring';
import { SuitabilityCard } from '../components/SuitabilityCard';
import { RawWxViewer } from '../components/RawWxViewer';
import { RunwayWindCalculator } from '../components/RunwayWindCalculator';
import { DashboardToolbar } from '../components/DashboardToolbar';
import { CalendarView } from '../components/CalendarView';
import { WeatherDetailsModal } from '../components/WeatherDetailsModal';
import { TimelineChart } from '../components/TimelineChart';

import { WeatherMap } from '../components/WeatherMap';
import { format } from 'date-fns';
import { Loader, AlertCircle, Plane } from 'lucide-react';
import type { WeatherWindow } from '../types/weather';

type ViewMode = 'timeline' | 'calendar' | 'map';

export const Dashboard = () => {
    const [stationId, setStationId] = useState('KMCI');
    const [searchMode, setSearchMode] = useState<'single' | 'route'>('single');
    const [route, setRoute] = useState<{ from: string, to: string | null }>({ from: 'KMCI', to: null });
    // searchInput state removed, handled in AirportSearch
    const { profiles, activeProfile, setActiveProfileId } = useProfiles();
    const { fleet, activeAircraft, activeAircraftId, setActiveAircraftId, addAircraft, deleteAircraft } = useAircraft();
    const [isAircraftManagerOpen, setIsAircraftManagerOpen] = useState(false);

    const [selectedWindow, setSelectedWindow] = useState<WeatherWindow | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('timeline');

    // Demo coords
    const [coords] = useState({ lat: 39.2976, lon: -94.7139 });

    const { weatherData, loading, error, refresh } = useWeather(stationId, coords.lat, coords.lon);

    // handleSearch removed

    const currentWindow = selectedWindow || (weatherData.length > 0 ? weatherData[0] : null);
    const currentResult = currentWindow ? ScoringEngine.calculateSuitability(currentWindow, activeProfile) : null;

    return (
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-8 min-h-screen text-slate-800 dark:text-slate-200 animate-fade-in relative transition-colors">

            {/* Unified Header & Toolbar */}
            <header className="mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6">

                {/* Left: Branding & Station */}
                <div className="flex flex-col gap-1">
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm tracking-wide uppercase">Flight Weather Dashboard</p>
                    <div className="flex items-baseline gap-4">
                        <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
                            {searchMode === 'single' ? (
                                stationId
                            ) : (
                                <>
                                    <span>{route.from}</span>
                                    <span className="text-slate-300 dark:text-slate-600 text-3xl"><Plane className="w-8 h-8 animate-pulse" /></span>
                                    <span className={route.to ? "text-slate-900 dark:text-slate-100" : "text-slate-300 dark:text-slate-600"}>
                                        {route.to || '???'}
                                    </span>
                                </>
                            )}
                        </h1>
                        <div className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                            LIVE
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                        Planning for <span className="text-slate-700 dark:text-slate-300 font-bold">{activeProfile.name}</span>
                    </p>
                </div>

                {/* Right: Controls (Search + Profile + View) */}
                {/* Toolbar Replaced Content */}
                <div className="mb-6">
                    <DashboardToolbar
                        searchMode={searchMode}
                        setSearchMode={setSearchMode}
                        stationId={stationId}
                        setStationId={setStationId}
                        route={route}
                        setRoute={setRoute}
                        fleet={fleet}
                        activeAircraftId={activeAircraftId}
                        setActiveAircraftId={setActiveAircraftId}
                        setIsAircraftManagerOpen={setIsAircraftManagerOpen}
                        profiles={profiles}
                        activeProfileId={activeProfile.id}
                        setActiveProfileId={setActiveProfileId}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        onRefresh={refresh}
                    />
                </div>



            </header >

            {/* Route Briefing Panel */}
            {
                searchMode === 'route' && route.to && (
                    <RouteBriefing
                        from={route.from}
                        to={route.to}
                        profile={activeProfile}
                        aircraft={activeAircraft}
                    />
                )
            }

            {
                loading && weatherData.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center">
                        <Loader className="w-10 h-10 animate-spin mb-4 text-sky-500" />
                        <p className="font-medium animate-pulse">Fetching latest METARs & TAFs...</p>
                    </div>
                ) : error ? (
                    <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-4 text-red-600 dark:text-red-400">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                        {error}
                    </div>
                ) : weatherData.length > 0 && currentWindow && currentResult ? (
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">

                        {/* Sidebar: Detail Panel */}
                        <div className="xl:col-span-1 space-y-6 xl:sticky xl:top-24">
                            <SuitabilityCard
                                result={currentResult}
                            />

                            {/* Runway Wind Tool */}
                            <RunwayWindCalculator wind={currentWindow.wind} />

                            {/* Placeholder for future widgets (e.g. Airport Info) */}
                            <div className="hidden xl:block p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 text-center">
                                Select a time block to view specific conditions.
                            </div>
                        </div>

                        {/* Main Content: Calendar / Timeline */}
                        <div className="xl:col-span-3">
                            {viewMode === 'calendar' ? (
                                <CalendarView
                                    windows={weatherData}
                                    profile={activeProfile}
                                    onSelectDay={(date) => {
                                        // Find exact match or closest window
                                        const win = weatherData.find(w => format(w.startTime, 'yyyy-MM-dd HH:mm') === format(date, 'yyyy-MM-dd HH:mm'));
                                        if (win) {
                                            setSelectedWindow(win);
                                        } else {
                                            const closeWin = weatherData.find(w => Math.abs(w.startTime.getTime() - date.getTime()) < 60 * 60 * 1000);
                                            if (closeWin) setSelectedWindow(closeWin);
                                        }
                                    }}
                                />
                            ) : viewMode === 'map' ? (
                                <WeatherMap
                                    currentStation={stationId}
                                    onSelect={(icao) => {
                                        setStationId(icao);
                                        // Optionally switch back to timeline after selection, or stay on map?
                                        // Let's stay on map for now.
                                    }}
                                    route={searchMode === 'route' ? route : undefined}
                                />
                            ) : (
                                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 min-h-[400px] transition-colors">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 font-display">48-Hour Training Outlook</h3>
                                    <TimelineChart windows={weatherData} profile={activeProfile} onSelectWindow={setSelectedWindow} />
                                </div>
                            )}
                        </div>

                    </div>
                ) : null
            }

            {/* Raw Weather Text */}
            {
                !loading && weatherData.length > 0 && searchMode !== 'route' && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
                        <RawWxViewer stationId={stationId} weatherData={weatherData} />
                    </div>
                )
            }

            {/* Detail Modal */}
            {
                selectedWindow && currentResult && (
                    <WeatherDetailsModal
                        window={selectedWindow}
                        result={currentResult}
                        stationId={stationId}
                        onClose={() => setSelectedWindow(null)}
                    />
                )
            }
            {/* Aircraft Manager Modal */}
            <AircraftManager
                isOpen={isAircraftManagerOpen}
                onClose={() => setIsAircraftManagerOpen(false)}
                fleet={fleet}
                onAdd={addAircraft}
                onDelete={deleteAircraft}
            />
        </div >
    );
};
