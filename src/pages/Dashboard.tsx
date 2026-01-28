import { useState } from 'react';
import { useWeather } from '../hooks/useWeather';
import { DEFAULT_PROFILES, type TrainingProfile } from '../types/profile';
import { ScoringEngine } from '../logic/scoring';
import { SuitabilityCard } from '../components/SuitabilityCard';
import { CalendarView } from '../components/CalendarView';
import { WeatherDetailsModal } from '../components/WeatherDetailsModal';
import { TimelineChart } from '../components/TimelineChart';
import { format } from 'date-fns';
import { Search, Loader, RefreshCw, AlertCircle, Calendar as CalendarIcon, LayoutList } from 'lucide-react';
import type { WeatherWindow } from '../types/weather';
import clsx from 'clsx';
import { GlassCard } from '../components/ui/GlassCard';
import { InstrumentBadge } from '../components/ui/InstrumentBadge';

export const Dashboard = () => {
    const [stationId, setStationId] = useState('KMCI');
    const [searchInput, setSearchInput] = useState('KMCI');
    const [selectedProfile, setSelectedProfile] = useState<TrainingProfile>(DEFAULT_PROFILES[0]);
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
    const currentResult = currentWindow ? ScoringEngine.calculateSuitability(currentWindow, selectedProfile) : null;

    return (
        <div className="container max-w-7xl mx-auto px-6 pb-20 pt-10 animate-fade-in text-slate-800">

            {/* Unified Header & Toolbar */}
            <header className="mb-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">

                {/* Left: Branding & Station */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-baseline gap-4">
                        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
                            Flight Dashboard
                        </h1>
                        <InstrumentBadge variant="info" className="text-sm shadow-sm px-3 py-1">{stationId}</InstrumentBadge>
                    </div>
                    <p className="text-slate-500 font-medium">
                        Planning for <span className="text-slate-700 font-bold">{selectedProfile.name}</span>
                    </p>
                </div>

                {/* Right: Controls (Search + Profile + View) */}
                <GlassCard className="p-2 flex flex-wrap items-center gap-3 bg-white/80 backdrop-blur-md border-slate-200">

                    {/* Search */}
                    <form onSubmit={handleSearch} className="relative group">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 w-32 focus:w-48 transition-all outline-none uppercase font-bold text-sm text-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                            placeholder="ICAO"
                        />
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                    </form>

                    <div className="h-6 w-px bg-slate-200 mx-1"></div>

                    {/* Profile Selector */}
                    <div className="relative">
                        <select
                            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-slate-700 outline-none focus:border-sky-500 cursor-pointer hover:bg-slate-100 transition-colors"
                            value={selectedProfile.id}
                            onChange={(e) => {
                                const p = DEFAULT_PROFILES.find(x => x.id === e.target.value);
                                if (p) setSelectedProfile(p);
                            }}
                        >
                            {DEFAULT_PROFILES.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-3 pointer-events-none">
                            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-400"></div>
                        </div>
                    </div>

                    <div className="h-6 w-px bg-slate-200 mx-1"></div>

                    {/* View Toggles */}
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button
                            onClick={() => setShowCalendar(false)}
                            className={clsx("p-2 rounded-md transition-all",
                                !showCalendar ? 'bg-white text-sky-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600')}
                            title="Timeline View"
                        >
                            <LayoutList className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setShowCalendar(true)}
                            className={clsx("p-2 rounded-md transition-all",
                                showCalendar ? 'bg-white text-sky-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600')}
                            title="Calendar View"
                        >
                            <CalendarIcon className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Refresh */}
                    <button onClick={refresh} className="p-2.5 text-slate-400 hover:text-sky-500 hover:bg-slate-50 rounded-lg transition-all border border-transparent hover:border-slate-200" title="Refresh Data">
                        <RefreshCw className={loading ? "animate-spin w-4 h-4" : "w-4 h-4"} />
                    </button>

                </GlassCard>
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
                <div className="space-y-6">

                    {/* Main Info Card for Selected Time */}
                    <SuitabilityCard
                        result={currentResult}
                        timeLabel={selectedWindow
                            ? format(currentWindow.startTime, 'MMM d, h:mm a')
                            : 'Current Conditions'
                        }
                    />

                    {/* Visualization Switcher */}
                    {showCalendar ? (
                        <CalendarView
                            windows={weatherData}
                            profile={selectedProfile}
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
                        <GlassCard className="p-6 min-h-[400px]">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 font-display">48-Hour Training Outlook</h3>
                            <TimelineChart windows={weatherData} profile={selectedProfile} onSelectWindow={setSelectedWindow} />
                        </GlassCard>
                    )}

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
