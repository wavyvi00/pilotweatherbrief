import React, { useState } from 'react';
import { X, Cloud, AlertTriangle } from 'lucide-react';
import { SuitabilityCard } from './SuitabilityCard';
import type { WeatherWindow } from '../types/weather';
import type { SuitabilityResult } from '../logic/scoring';
import { format } from 'date-fns';
import { NotamViewer } from './NotamViewer';


interface WeatherDetailsModalProps {
    window: WeatherWindow;
    result: SuitabilityResult;
    stationId: string; // Added stationId
    onClose: () => void;
}

export const WeatherDetailsModal: React.FC<WeatherDetailsModalProps> = ({ window, result, stationId, onClose }) => {
    const [activeTab, setActiveTab] = useState<'weather' | 'notams'>('weather');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg overflow-hidden animate-fade-in shadow-2xl bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 relative max-h-[90vh] flex flex-col transition-colors">
                <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0">
                    <div>
                        <h3 className="font-display font-bold text-xl text-slate-900 dark:text-slate-100">
                            {stationId} Details
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{format(window.startTime, 'MMM d, h:mm a')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-full transition-all text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shadow-sm">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 dark:border-slate-700 px-5 gap-6">
                    <button
                        onClick={() => setActiveTab('weather')}
                        className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'weather' ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    >
                        <Cloud className="w-4 h-4" />
                        Weather
                    </button>
                    <button
                        onClick={() => setActiveTab('notams')}
                        className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'notams' ? 'border-red-500 text-red-600 dark:text-red-400' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    >
                        <AlertTriangle className="w-4 h-4" />
                        NOTAMs
                    </button>
                </div>

                <div className="p-6 bg-white dark:bg-slate-800 overflow-y-auto">
                    {activeTab === 'weather' ? (
                        <>
                            <SuitabilityCard result={result} />

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1 tracking-wider">Wind</div>
                                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">
                                        {window.wind.direction}° @ {window.wind.speed}kt
                                    </div>
                                    {window.wind.gust > 0 && <div className="text-sm text-amber-600 dark:text-amber-500 font-bold mt-1">Gusts {window.wind.gust}kt</div>}
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1 tracking-wider">Clouds</div>
                                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">
                                        {window.ceiling > 20000 ? 'Unlimited' : `${window.ceiling} ft`}
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1 tracking-wider">Visibility</div>
                                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">
                                        {Number(window.visibility).toFixed(1)} sm
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1 tracking-wider">Precipitation</div>
                                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">
                                        {window.precipitationProbability}%
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <NotamViewer stationId={stationId} />
                    )}
                </div>
            </div>
        </div>
    );
};
