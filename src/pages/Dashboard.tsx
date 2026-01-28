import { useState } from 'react';
import { useWeather } from '../hooks/useWeather';
import { useProfiles } from '../hooks/useProfiles';
import { ScoringEngine } from '../logic/scoring';
import { SuitabilityCard } from '../components/SuitabilityCard';
import { CalendarView } from '../components/CalendarView';
import { WeatherDetailsModal } from '../components/WeatherDetailsModal';
import { TimelineChart } from '../components/TimelineChart';
import { format } from 'date-fns';
import { Search, Loader, RefreshCw, AlertCircle, Calendar as CalendarIcon, LayoutList } from 'lucide-react';
import type { WeatherWindow } from '../types/weather';
import clsx from 'clsx';
import { InstrumentBadge } from '../components/ui/InstrumentBadge';

export const Dashboard = () => {
    const [stationId, setStationId] = useState('KMCI');
    const [searchInput, setSearchInput] = useState('KMCI');
    const { profiles, activeProfile, setActiveProfileId } = useProfiles();
    const [selectedWindow, setSelectedWindow] = useState<WeatherWindow | null>(null);
    const [showCalendar, setShowCalendar] = useState(false);

    // Demo coords
    const [coords] = useState({ lat: 39.2976, lon: -94.7139 });

    const { weatherData, loading, error, refresh } = useWeather(stationId, coords.lat, coords.lon);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.length >= 3) {
            setStationId(searchInput.toUpperCase());
        }
    };

    const currentWindow = selectedWindow || (weatherData.length > 0 ? weatherData[0] : null);
    const currentResult = currentWindow ? ScoringEngine.calculateSuitability(currentWindow, activeProfile) : null;

    return (
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-8 min-h-screen text-slate-800 animate-fade-in relative">

            {/* Unified Header & Toolbar */}
            <header className="mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6">

                {/* Left: Branding & Station */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-baseline gap-4">
                        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
                            Flight Dashboard
                        </h1>
                        <InstrumentBadge variant="info" className="text-sm shadow-sm px-3 py-1">{stationId}</InstrumentBadge>
                    </div>
                    <p className="text-slate-500 font-medium">
                        Planning for <span className="text-slate-700 font-bold">{activeProfile.name}</span>
                    </p>
                </div>

                {/* Right: Controls (Search + Profile + View) */}
                <div className="flex flex-wrap items-center gap-4">

                    {/* Search */}
                    <form onSubmit={handleSearch} className="relative group">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 w-40 focus:w-56 transition-all outline-none uppercase font-bold text-sm text-slate-800 shadow-sm focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 placeholder:text-slate-400"
                            placeholder="ICAO"
                        />
                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                    </form>

                    {/* Profile Selector */}
                    <div className="relative">
                        <select
                            className="appearance-none bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-sm font-bold text-slate-700 shadow-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 cursor-pointer hover:border-gray-300 transition-all min-w-[200px]"
                            value={activeProfile.id}
                            onChange={(e) => setActiveProfileId(e.target.value)}
                        >
                            {profiles.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-3 pointer-events-none text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                    </div>

                    {/* View Toggles */}
                    <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                        <button
                            onClick={() => setShowCalendar(false)}
                            className={clsx("p-2 rounded-md transition-all flex items-center justify-center",
                                !showCalendar ? 'bg-slate-100 text-sky-600 font-bold' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50')}
                            title="Timeline View"
                        >
                            <LayoutList className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setShowCalendar(true)}
                            className={clsx("p-2 rounded-md transition-all flex items-center justify-center",
                                showCalendar ? 'bg-slate-100 text-sky-600 font-bold' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50')}
                            title="Calendar View"
                        >
                            <CalendarIcon className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Refresh */}
                    <button onClick={refresh} className="p-2.5 bg-white border border-gray-200 shadow-sm text-slate-500 hover:text-sky-600 hover:border-sky-500 rounded-lg transition-all" title="Refresh Data">
                        <RefreshCw className={loading ? "animate-spin w-4 h-4" : "w-4 h-4"} />
                    </button>

                </div>


            </header>

            {loading && weatherData.length === 0 ? (
                <div className="py-20 text-center text-slate-400 flex flex-col items-center">
                    <Loader className="w-10 h-10 animate-spin mb-4 text-sky-500" />
                    <p className="font-medium text-slate-500">Scanning Atmosphere...</p>
                </div>
            ) : error ? (
                <div className="p-6 bg-red-50 border border-red-100 rounded-xl flex items-center gap-4 text-red-600">
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
                        {/* Placeholder for future widgets (e.g. Airport Info) */}
                        <div className="hidden xl:block p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-400 text-center">
                            Select a time block to view specific conditions.
                        </div>
                    </div>

                    {/* Main Content: Calendar / Timeline */}
                    <div className="xl:col-span-3">
                        {showCalendar ? (
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
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[400px]">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 font-display">48-Hour Training Outlook</h3>
                                <TimelineChart windows={weatherData} profile={activeProfile} onSelectWindow={setSelectedWindow} />
                            </div>
                        )}
                    </div>

                </div>
            ) : null}

            {/* Detail Modal */}
            {selectedWindow && currentResult && (
                <WeatherDetailsModal
                    window={selectedWindow}
                    result={currentResult}
                    onClose={() => setSelectedWindow(null)}
                />
            )}
        </div>
    );
};
