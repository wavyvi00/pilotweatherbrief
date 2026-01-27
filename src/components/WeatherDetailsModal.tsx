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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                    <h3 className="font-display font-bold text-lg text-slate-800">
                        {format(window.startTime, 'MMM d, h:mm a')}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6">
                    <SuitabilityCard
                        result={result}
                        timeLabel="Forecast Details"
                    />

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="text-xs text-slate-500 uppercase font-bold">Wind</div>
                            <div className="text-lg font-semibold text-slate-800">
                                {window.wind.direction}° @ {window.wind.speed}kt
                            </div>
                            {window.wind.gust > 0 && <div className="text-sm text-amber-600">Gusts {window.wind.gust}kt</div>}
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="text-xs text-slate-500 uppercase font-bold">Clouds</div>
                            <div className="text-lg font-semibold text-slate-800">
                                {window.ceiling > 20000 ? 'Unlimited' : `${window.ceiling} ft`}
                            </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="text-xs text-slate-500 uppercase font-bold">Visibility</div>
                            <div className="text-lg font-semibold text-slate-800">
                                {window.visibility} sm
                            </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="text-xs text-slate-500 uppercase font-bold">Precipitation</div>
                            <div className="text-lg font-semibold text-slate-800">
                                {window.precipProb}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
