import { useState, useEffect, useMemo } from 'react';
import { useWeather } from '../hooks/useWeather';
import { RouteBriefing } from '../components/RouteBriefing';
import { useProfiles } from '../hooks/useProfiles';
import { useAircraft } from '../hooks/useAircraft';

import { useSettings } from '../hooks/useSettings';
import { useAirportData } from '../hooks/useAirportData';
import { useFuelPrice } from '../hooks/useFuelPrice';
import { AircraftManager } from '../components/AircraftManager';
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
import { Loader, AlertCircle, Plane, Calendar, Map as MapIcon, ChevronRight, MapPin, Fuel } from 'lucide-react';
import { ScoringEngine } from '../logic/scoring';
import { SuitabilityCard } from '../components/SuitabilityCard';
import { RawWxViewer } from '../components/RawWxViewer';
import { RunwayWindCalculator } from '../components/RunwayWindCalculator';
import type { WeatherWindow } from '../types/weather';
import { GatedFeature } from '../components/GatedFeature';

// New Components
import { DashboardHeader } from '../components/DashboardHeader';
import { FlightStatusHero } from '../components/FlightStatusHero';
import { WeatherMetricsBar } from '../components/WeatherMetricsBar';


export type ViewMode = 'timeline' | 'calendar' | 'map' | 'wb' | 'checklist';

export const Dashboard = () => {
    const { settings, updateSetting } = useSettings();

    const [stationId, setStationId] = useState(settings.defaultAirport || 'KMCI');

    // Sync stationId when settings load from cloud (fixes race condition)
    useEffect(() => {
        if (settings.defaultAirport && settings.defaultAirport !== stationId) {
            setStationId(settings.defaultAirport);
            setRoute(createSimpleRoute(settings.defaultAirport, ''));
        }
    }, [settings.defaultAirport]);

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
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-4 min-h-screen text-[var(--text-main)] transition-colors">

            {/* NEW HEADER */}
            <DashboardHeader
                stationId={stationId}
                searchMode={searchMode}
                setSearchMode={setSearchMode}
                activeProfile={activeProfile}
                activeAircraft={activeAircraft}
            />

            {/* Main Control Bar */}
            <div className="mb-8">
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

            {loading && weatherData.length === 0 ? (
                <div className="py-32 text-center text-slate-400 flex flex-col items-center animate-fade-in">
                    <Loader className="w-8 h-8 animate-spin mb-4 text-[var(--accent)]" />
                    <p className="font-medium">Fetching conditions...</p>
                </div>
            ) : error ? (
                <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-600">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                    {error}
                </div>
            ) : (
                <main className="animate-fade-in space-y-12 mt-4">

                    {/* HERO SECTION */}
                    {searchMode === 'single' && currentResult && (
                        <div className="flex flex-col gap-8">
                            <FlightStatusHero result={currentResult} />

                            <WeatherMetricsBar
                                window={currentWindow}
                                stationElevation={stationElevation}
                            />
                        </div>
                    )}

                    {/* ROUTE MODE HERO */}
                    {searchMode === 'route' && hasValidDestination(route) && (
                        <div className="mb-6">
                            {/* Route Briefing Component is largely unchanged but wrapped */}
                            <GatedFeature>
                                <RouteBriefing
                                    from={routeCompat.from}
                                    to={routeCompat.to!}
                                    profile={activeProfile}
                                    aircraft={activeAircraft}
                                />
                            </GatedFeature>

                            {/* Route Waypoint Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                            <Plane className="w-4 h-4 text-slate-600" />
                                        </div>
                                        <span className="font-bold text-lg">{stationId}</span>
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
                                {waypointWeatherData.map((wpData, index) => (
                                    <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                <MapPin className="w-4 h-4 text-slate-600" />
                                            </div>
                                            <span className="font-bold text-lg">{wpData.icao}</span>
                                        </div>
                                        <AirportWeatherPanel
                                            stationId={wpData.icao}
                                            weatherData={wpData.weather}
                                            profile={activeProfile}
                                            selectedTime={selectedTime}
                                            compact
                                            aircraft={activeAircraft}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                    {/* TRAINING OUTLOOK (CHART) */}
                    {viewMode === 'timeline' && searchMode === 'single' && (
                        <div className="bg-white rounded-[24px] shadow-[var(--shadow-card)] border border-[var(--border-light)] p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold font-display text-slate-900">48-Hour Forecast</h3>
                                <div className="flex gap-2">
                                    {/* Legend / Controls could go here */}
                                </div>
                            </div>
                            <GatedFeature blur={true}>
                                <TimelineChart windows={weatherData} profile={activeProfile} aircraft={activeAircraft} onSelectWindow={setSelectedWindow} />
                            </GatedFeature>
                        </div>
                    )}

                    {/* SECONDARY GRID (Runways, Raw Data, Checklists) */}
                    {searchMode === 'single' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Left Col: Runway Winds & Raw Data */}
                            <div className="space-y-8">
                                <section>
                                    <h3 className="text-lg font-bold font-display text-slate-900 mb-4">Runway Winds</h3>
                                    <div className="bg-white rounded-[24px] shadow-[var(--shadow-card)] border border-[var(--border-light)] overflow-hidden">
                                        <RunwayWindCalculator wind={currentWindow?.wind || { direction: 0, speed: 0 }} stationId={stationId} />
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-lg font-bold font-display text-slate-900 mb-4">Station Data</h3>
                                    <div className="bg-white rounded-[24px] shadow-[var(--shadow-card)] border border-[var(--border-light)] p-1">
                                        <RawWxViewer stationId={stationId} weatherData={weatherData} />
                                    </div>
                                </section>
                            </div>

                            {/* Right Col: Checklist or Map */}
                            <div className="space-y-8">
                                <section>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold font-display text-slate-900">Preflight Checklist</h3>
                                    </div>
                                    <div className="bg-white rounded-[24px] shadow-[var(--shadow-card)] border border-[var(--border-light)] p-6">
                                        <ChecklistViewer />
                                    </div>
                                </section>
                            </div>

                        </div>
                    )}

                    {/* OTHER VIEW MODES */}
                    {viewMode === 'calendar' && (
                        <CalendarView
                            windows={weatherData}
                            profile={activeProfile}
                            aircraft={activeAircraft}
                            onSelectDay={(date) => {
                                // Find exact match or closest window
                                const win = weatherData.find(w => format(w.startTime, 'yyyy-MM-dd HH:mm') === format(date, 'yyyy-MM-dd HH:mm'));
                                if (win) {
                                    setSelectedWindow(win);
                                }
                            }}
                        />
                    )}
                    {viewMode === 'map' && (
                        <div className="h-[600px] rounded-[24px] overflow-hidden shadow-[var(--shadow-card)] border border-[var(--border-light)]">
                            <WeatherMap
                                currentStation={stationId}
                                onSelect={setStationId}
                                route={searchMode === 'route' ? route : undefined}
                            />
                        </div>
                    )}
                </main>
            )}

            {/* MODALS */}
            {selectedWindow && currentResult && (
                <WeatherDetailsModal
                    window={selectedWindow}
                    result={currentResult}
                    stationId={stationId}
                    onClose={() => setSelectedWindow(null)}
                />
            )}

            <AircraftManager
                isOpen={isAircraftManagerOpen}
                onClose={() => setIsAircraftManagerOpen(false)}
                fleet={fleet}
                onAdd={addAircraft}
                onUpdate={updateAircraft}
                onDelete={deleteAircraft}
            />
        </div>
    );
};
