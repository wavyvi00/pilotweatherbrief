import { useState, useEffect, useMemo } from 'react';
import { useWeather } from '../hooks/useWeather';
import { RouteBriefing } from '../components/RouteBriefing';
import { useProfiles } from '../hooks/useProfiles';
import { useAircraft } from '../hooks/useAircraft';

import { useSettings } from '../hooks/useSettings';
import { useAirportData } from '../hooks/useAirportData';
import { useFuelPrice } from '../hooks/useFuelPrice';
import { AircraftManager } from '../components/AircraftManager';
import { ScoringEngine } from '../logic/scoring';
import { SuitabilityCard } from '../components/SuitabilityCard';
import { RawWxViewer } from '../components/RawWxViewer';
import { RunwayWindCalculator } from '../components/RunwayWindCalculator';
import { DashboardToolbar } from '../components/DashboardToolbar';
import { CalendarView } from '../components/CalendarView';
import { WeightBalanceCalculator } from '../components/WeightBalanceCalculator';
import { ChecklistViewer } from '../components/ChecklistViewer';
import { WeatherDetailsModal } from '../components/WeatherDetailsModal';
import { TimelineChart } from '../components/TimelineChart';
import { AirportWeatherPanel } from '../components/AirportWeatherPanel';
import { AIRPORTS } from '../data/airports';
import type { Route } from '../types/route';
import { createSimpleRoute, hasValidDestination, getRouteIcaos } from '../types/route';

import { WeatherMap } from '../components/WeatherMap';
import { format, isWithinInterval } from 'date-fns';
import { Loader, AlertCircle, Plane, RotateCcw, Flag, MapPin, Fuel } from 'lucide-react';
import type { WeatherWindow } from '../types/weather';



export type ViewMode = 'timeline' | 'calendar' | 'map' | 'wb' | 'checklist';

export const Dashboard = () => {
    const { settings, updateSetting } = useSettings();

    const [stationId, setStationId] = useState(settings.defaultAirport || 'KMCI');

    // Wrapper to persist station changes
    const handleStationChange = (id: string) => {
        setStationId(id);
        updateSetting('defaultAirport', id);
    };

    const [searchMode, setSearchMode] = useState<'single' | 'route'>('single');
    // New Route array format
    const [route, setRoute] = useState<Route>(() =>
        createSimpleRoute(settings.defaultAirport || 'KMCI', '')
    );

    // For backward compatibility with old { from, to } format in some components
    const routeCompat = useMemo(() => ({
        from: route[0]?.icao || stationId,
        to: route.length >= 2 ? route[route.length - 1]?.icao : null
    }), [route, stationId]);

    const { profiles, activeProfile, setActiveProfileId } = useProfiles();
    const { fleet, activeAircraft, activeAircraftId, setActiveAircraftId, addAircraft, updateAircraft, deleteAircraft } = useAircraft();
    const [isAircraftManagerOpen, setIsAircraftManagerOpen] = useState(false);

    // Apply default aircraft/profile from settings on mount
    useEffect(() => {
        if (settings.defaultAircraftId && fleet.find(a => a.id === settings.defaultAircraftId)) {
            setActiveAircraftId(settings.defaultAircraftId);
        }
        if (settings.defaultProfileId && profiles.find(p => p.id === settings.defaultProfileId)) {
            setActiveProfileId(settings.defaultProfileId);
        }
    }, []); // Run once on mount

    const [selectedWindow, setSelectedWindow] = useState<WeatherWindow | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('timeline');
    const [selectedTime, setSelectedTime] = useState<Date | null>(null); // null = LIVE mode

    // Get coordinates for departure airport
    const departureAirport = useMemo(() =>
        AIRPORTS.find(a => a.icao === stationId),
        [stationId]
    );
    const depCoords = departureAirport
        ? { lat: departureAirport.lat, lon: departureAirport.lon }
        : { lat: 39.2976, lon: -94.7139 }; // Fallback to KMCI

    // Fetch Airport Data (Elevation, Runways) for Scoring
    const { elevation: stationElevation, maxRunwayLength } = useAirportData(stationId, depCoords.lat, depCoords.lon);

    // Get all unique ICAO codes from route (excluding departure which is fetched separately)
    const routeWaypointIcaos = useMemo(() => {
        const allIcaos = getRouteIcaos(route);
        // Exclude the first one (departure) since it's already fetched
        return allIcaos.slice(1);
    }, [route]);

    // Fetch weather for departure
    const { weatherData, loading, error, refresh } = useWeather(stationId, depCoords.lat, depCoords.lon);

    // Fetch weather for all route waypoints (up to 5 additional waypoints)
    // We'll use separate useWeather calls for simplicity (React hooks rules)
    const wp1 = routeWaypointIcaos[0] || '';
    const wp1Airport = AIRPORTS.find(a => a.icao === wp1);
    const { weatherData: wp1Weather, loading: wp1Loading, error: wp1Error } = useWeather(
        searchMode === 'route' ? wp1 : '',
        wp1Airport?.lat || 0,
        wp1Airport?.lon || 0
    );
    
    // Fetch fuel price for primary station
    const { price: fuelPrice } = useFuelPrice(stationId);

    const wp2 = routeWaypointIcaos[1] || '';
    const wp2Airport = AIRPORTS.find(a => a.icao === wp2);
    const { weatherData: wp2Weather, loading: wp2Loading, error: wp2Error } = useWeather(
        searchMode === 'route' ? wp2 : '',
        wp2Airport?.lat || 0,
        wp2Airport?.lon || 0
    );

    const wp3 = routeWaypointIcaos[2] || '';
    const wp3Airport = AIRPORTS.find(a => a.icao === wp3);
    const { weatherData: wp3Weather, loading: wp3Loading, error: wp3Error } = useWeather(
        searchMode === 'route' ? wp3 : '',
        wp3Airport?.lat || 0,
        wp3Airport?.lon || 0
    );

    // Build array of waypoint weather data for rendering
    const waypointWeatherData = useMemo(() => {
        const result: { icao: string; weather: WeatherWindow[]; loading: boolean; error: string | null }[] = [];
        if (wp1) result.push({ icao: wp1, weather: wp1Weather, loading: wp1Loading, error: wp1Error });
        if (wp2) result.push({ icao: wp2, weather: wp2Weather, loading: wp2Loading, error: wp2Error });
        if (wp3) result.push({ icao: wp3, weather: wp3Weather, loading: wp3Loading, error: wp3Error });
        return result;
    }, [wp1, wp1Weather, wp1Loading, wp1Error, wp2, wp2Weather, wp2Loading, wp2Error, wp3, wp3Weather, wp3Loading, wp3Error]);

    // Determine if we're in LIVE mode
    const isLive = selectedTime === null;

    // Find the weather window matching the selected time
    const getWindowForTime = (time: Date | null) => {
        if (!time || weatherData.length === 0) return weatherData[0] || null;

        // Find the window that contains this time
        const matchingWindow = weatherData.find(w => {
            const windowEnd = new Date(w.startTime.getTime() + 60 * 60 * 1000); // 1 hour window
            return isWithinInterval(time, { start: w.startTime, end: windowEnd });
        });

        // If no exact match, find the closest window
        if (!matchingWindow) {
            const closest = weatherData.reduce((prev, curr) => {
                const prevDiff = Math.abs(prev.startTime.getTime() - time.getTime());
                const currDiff = Math.abs(curr.startTime.getTime() - time.getTime());
                return currDiff < prevDiff ? curr : prev;
            });
            return closest;
        }

        return matchingWindow;
    };

    const currentWindow = selectedWindow || getWindowForTime(selectedTime);

    // Calculate suitability with extended context
    const currentResult = currentWindow ? ScoringEngine.calculateSuitability(currentWindow, activeProfile, {
        stationElevation,
        maxRunwayLength,
        aircraft: activeAircraft
    }) : null;

    return (
        <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 md:px-8 py-4 sm:py-8 min-h-screen text-slate-800 dark:text-slate-200 animate-fade-in relative transition-colors">

            {/* Unified Header & Toolbar */}
            <header className="mb-3 sm:mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-3 sm:gap-6">

                {/* Left: Branding & Station - Compact on mobile */}
                <div className="flex flex-col gap-0.5 sm:gap-1">
                    {/* Hide subtitle on mobile */}
                    <p className="hidden sm:block text-slate-500 dark:text-slate-400 font-medium text-sm tracking-wide uppercase">Flight Weather Dashboard</p>
                    <div className="flex items-baseline gap-2 sm:gap-4">
                        <h1 className="text-2xl sm:text-4xl font-display font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2 sm:gap-3">
                            {searchMode === 'single' ? (
                                stationId
                            ) : (
                                <>
                                    <span>{routeCompat.from}</span>
                                    <span className="text-slate-300 dark:text-slate-600 text-xl sm:text-3xl"><Plane className="w-5 h-5 sm:w-8 sm:h-8 animate-pulse" /></span>
                                    <span className={routeCompat.to ? "text-slate-900 dark:text-slate-100" : "text-slate-300 dark:text-slate-600"}>
                                        {routeCompat.to || '???'}
                                    </span>
                                </>
                            )}
                        </h1>
                        {isLive ? (
                            <div className="px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] sm:text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                                LIVE
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 sm:gap-2">
                                <div className="px-2 sm:px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 text-[10px] sm:text-xs font-bold border border-sky-200 dark:border-sky-800">
                                    {format(selectedTime!, 'MMM d, h:mm a')}
                                </div>
                                <button
                                    onClick={() => setSelectedTime(null)}
                                    className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    title="Reset to Now"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                </button>
                            </div>

                        )}
                        
                        {/* Fuel Price Badge */}
                        {fuelPrice && searchMode === 'single' && (
                            <div className="flex flex-col items-start sm:items-end ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/50">
                                    <Fuel className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                        ${fuelPrice.price.toFixed(2)}
                                    </span>
                                </div>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{fuelPrice.type}</span>
                            </div>
                        )}
                    </div>
                    {/* Hide "Planning for" on mobile - already shown in toolbar */}
                    <p className="hidden sm:block text-slate-500 dark:text-slate-400 font-medium mt-1">
                        Planning for <span className="text-slate-700 dark:text-slate-300 font-bold">{activeProfile.name}</span>
                    </p>
                </div>

                {/* Right: Toolbar */}
                <div>
                    <DashboardToolbar
                        searchMode={searchMode}
                        setSearchMode={setSearchMode}
                        stationId={stationId}
                        setStationId={handleStationChange}
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
                        selectedTime={selectedTime}
                        onTimeChange={setSelectedTime}
                        onRefresh={refresh}
                    />
                </div>

            </header>


            {/* Route Briefing Panel */}
            {
                searchMode === 'route' && hasValidDestination(route) && (
                    <RouteBriefing
                        from={routeCompat.from}
                        to={routeCompat.to!}
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
                    <>
                        {/* Route Mode: Horizontal weather panel strip above chart */}
                        {searchMode === 'route' && hasValidDestination(route) && (
                            <div className="mb-6">
                                {/* Route Weather Overview - Horizontal Cards */}
                                <div className="grid gap-4" style={{
                                    gridTemplateColumns: `repeat(${Math.min(route.length, 4)}, minmax(0, 1fr))`
                                }}>
                                    {/* Departure Panel */}
                                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                                                <Plane className="w-4 h-4 text-sky-500" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-sky-500 block">Departure</span>
                                                <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{stationId}</span>
                                            </div>
                                        </div>
                                        <AirportWeatherPanel
                                            stationId={stationId}
                                            weatherData={weatherData}
                                            profile={activeProfile}
                                            selectedTime={selectedTime}
                                            compact
                                            aircraft={activeAircraft}
                                        />
                                    </div>

                                    {/* Intermediate Stops + Destination */}
                                    {waypointWeatherData.map((wpData, index) => {
                                        const isDestination = index === waypointWeatherData.length - 1;

                                        return (
                                            <div
                                                key={wpData.icao || index}
                                                className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-4 ${isDestination
                                                    ? 'border-emerald-200 dark:border-emerald-900/50'
                                                    : 'border-amber-200 dark:border-amber-900/50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDestination
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                                        : 'bg-amber-100 dark:bg-amber-900/30'
                                                        }`}>
                                                        {isDestination
                                                            ? <Flag className="w-4 h-4 text-emerald-500" />
                                                            : <MapPin className="w-4 h-4 text-amber-500" />
                                                        }
                                                    </div>
                                                    <div>
                                                        <span className={`text-[10px] uppercase font-bold block ${isDestination ? 'text-emerald-500' : 'text-amber-500'
                                                            }`}>
                                                            {isDestination ? 'Destination' : `Stop ${index + 1}`}
                                                        </span>
                                                        <span className="text-lg font-bold text-slate-800 dark:text-slate-200">
                                                            {wpData.icao || '???'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {wpData.loading && wpData.weather.length === 0 ? (
                                                    <div className="p-4 text-center text-slate-400 dark:text-slate-500">
                                                        <Loader className="w-5 h-5 animate-spin mx-auto mb-1" />
                                                        <p className="text-xs">Loading...</p>
                                                    </div>
                                                ) : wpData.error ? (
                                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-xs">
                                                        {wpData.error}
                                                    </div>
                                                ) : (
                                                    <AirportWeatherPanel
                                                        stationId={wpData.icao}
                                                        weatherData={wpData.weather}
                                                        profile={activeProfile}
                                                        selectedTime={selectedTime}
                                                        compact
                                                        aircraft={activeAircraft}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Main Grid Content */}
                        <div className={searchMode === 'route' && hasValidDestination(route)
                            ? ''
                            : 'grid grid-cols-1 xl:grid-cols-4 gap-8 items-start'
                        }>
                            {/* Sidebar for Single Airport Mode */}
                            {searchMode !== 'route' || !hasValidDestination(route) ? (
                                <div className="xl:col-span-1 space-y-6 xl:sticky xl:top-24">
                                    <SuitabilityCard
                                        result={currentResult}
                                    />

                                    {/* Runway Wind Tool */}
                                    <RunwayWindCalculator wind={currentWindow.wind} stationId={stationId} />

                                    {/* Placeholder for future widgets */}
                                    <div className="hidden xl:block p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 text-center">
                                        Select a time block to view specific conditions.
                                    </div>
                                </div>
                            ) : null}

                            {/* Main Content: Calendar / Timeline */}
                            <div className={searchMode === 'route' && hasValidDestination(route) ? '' : 'xl:col-span-3'}>
                                {viewMode === 'calendar' ? (
                                    <CalendarView
                                        windows={weatherData}
                                        profile={activeProfile}
                                        aircraft={activeAircraft}
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
                                        route={searchMode === 'route' ? routeCompat : undefined}
                                    />
                                ) : viewMode === 'wb' ? (
                                    <div className="mt-6">
                                        <WeightBalanceCalculator />
                                    </div>
                                ) : viewMode === 'checklist' ? (
                                    <div className="mt-6 max-w-2xl mx-auto">
                                        <ChecklistViewer />
                                    </div>
                                ) : (
                                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 min-h-[400px] transition-colors">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 font-display">48-Hour Training Outlook</h3>
                                        <TimelineChart windows={weatherData} profile={activeProfile} aircraft={activeAircraft} onSelectWindow={setSelectedWindow} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
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
                onUpdate={updateAircraft}
                onDelete={deleteAircraft}
            />
        </div >
    );
};
