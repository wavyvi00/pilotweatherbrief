import React from 'react';
import { X } from 'lucide-react';
import { SuitabilityCard } from './SuitabilityCard';
import type { WeatherWindow } from '../types/weather';
import type { SuitabilityResult } from '../logic/scoring';
import { format } from 'date-fns';


interface WeatherDetailsModalProps {
    window: WeatherWindow;
    result: SuitabilityResult;
    onClose: () => void;
}

export const WeatherDetailsModal: React.FC<WeatherDetailsModalProps> = ({ window, result, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg overflow-hidden animate-fade-in shadow-2xl bg-white rounded-2xl border border-slate-200 relative">
                <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-display font-bold text-xl text-slate-900">
                        {format(window.startTime, 'MMM d, h:mm a')}
                    </h3>
                    <button onClick={onClose} className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-full transition-all text-slate-400 hover:text-slate-600 shadow-sm">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 bg-white">
                    <SuitabilityCard
                        result={result}
                        timeLabel="Forecast Details"
                    />

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-wider">Wind</div>
                            <div className="text-xl font-bold text-slate-900 font-display">
                                {window.wind.direction}° @ {window.wind.speed}kt
                            </div>
                            {window.wind.gust > 0 && <div className="text-sm text-amber-600 font-bold mt-1">Gusts {window.wind.gust}kt</div>}
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-wider">Clouds</div>
                            <div className="text-xl font-bold text-slate-900 font-display">
                                {window.ceiling > 20000 ? 'Unlimited' : `${window.ceiling} ft`}
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-wider">Visibility</div>
                            <div className="text-xl font-bold text-slate-900 font-display">
                                {window.visibility} sm
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-wider">Precipitation</div>
                            <div className="text-xl font-bold text-slate-900 font-display">
                                {window.precipitationProbability}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
