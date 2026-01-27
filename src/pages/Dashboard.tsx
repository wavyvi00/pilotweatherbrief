import { useState } from 'react';
import { useWeather } from '../hooks/useWeather';
import { DEFAULT_PROFILES, type TrainingProfile } from '../types/profile';
import { ScoringEngine } from '../logic/scoring';
import { SuitabilityCard } from '../components/SuitabilityCard';
import { CalendarView } from '../components/CalendarView';
import { WeatherDetailsModal } from '../components/WeatherDetailsModal'; // New Import
import { TimelineChart } from '../components/TimelineChart'; // Re-import Timeline if needed/used
import { format, isSameDay } from 'date-fns';
import { Search, Loader, RefreshCw, AlertCircle, Calendar as CalendarIcon, LayoutList } from 'lucide-react';
import type { WeatherWindow } from '../types/weather';
import clsx from 'clsx';

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
        <div className="container max-w-7xl mx-auto px-4 pb-20 pt-8 animate-fade-in text-slate-900">

            {/* Light Mode Header */}
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
                        Flight Dashboard
                    </h1>
                    <p className="text-slate-500">Planning for <span className="font-semibold text-sky-600">{stationId}</span></p>
                </div>

                <div className="flex gap-3">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-2 w-48 text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none uppercase font-medium shadow-sm transition-all"
                                placeholder="ICAO"
                            />
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        </div>
                        <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors">
                            Find
                        </button>
                    </form>
                </div>
            </header>

            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8 flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Profile</span>
                        <select
                            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-sky-500 cursor-pointer"
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
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button
                            onClick={() => setShowCalendar(false)}
                            className={clsx("px-4 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-all",
                                !showCalendar ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
                        >
                            <LayoutList className="w-4 h-4" /> List
                        </button>
                        <button
                            onClick={() => setShowCalendar(true)}
                            className={clsx("px-4 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-all",
                                showCalendar ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
                        >
                            <CalendarIcon className="w-4 h-4" /> Calendar
                        </button>
                    </div>

                    <button onClick={refresh} className="p-2 text-slate-400 hover:text-sky-600 transition-colors" title="Refresh">
                        <RefreshCw className={loading ? "animate-spin w-5 h-5" : "w-5 h-5"} />
                    </button>
                </div>
            </div>

            {loading && weatherData.length === 0 ? (
                <div className="py-20 text-center text-slate-400 flex flex-col items-center">
                    <Loader className="w-10 h-10 animate-spin mb-4 text-sky-600" />
                    <p className="font-medium text-slate-600">Loading Weather Data...</p>
                </div>
            ) : error ? (
                <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-4 text-red-700">
                    <AlertCircle className="w-6 h-6" />
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
                                // Simple logic: if user clicks a slot, we show that slot's window if present
                                const win = weatherData.find(w => format(w.startTime, 'yyyy-MM-dd HH:mm') === format(date, 'yyyy-MM-dd HH:mm'));
                                if (win) {
                                    setSelectedWindow(win);
                                } else {
                                    // Fallback: try to find one within same hour?
                                    const closeWin = weatherData.find(w => Math.abs(w.startTime.getTime() - date.getTime()) < 60 * 60 * 1000);
                                    if (closeWin) setSelectedWindow(closeWin);
                                }
                            }}
                        />
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[400px]">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">48-Hour Training Outlook</h3>
                            <TimelineChart windows={weatherData} profile={selectedProfile} onSelectWindow={setSelectedWindow} />
                        </div>
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
