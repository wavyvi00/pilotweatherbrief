import React from 'react';
import { format } from 'date-fns';
import type { WeatherWindow } from '../types/weather';
import type { TrainingProfile } from '../types/profile';
import type { Aircraft } from '../types/aircraft';
import { ScoringEngine } from '../logic/scoring';
import clsx from 'clsx';

interface TimelineChartProps {
    windows: WeatherWindow[];
    profile: TrainingProfile;
    aircraft?: Aircraft;
    onSelectWindow?: (window: WeatherWindow) => void;
}

export const TimelineChart: React.FC<TimelineChartProps> = ({ windows, profile, aircraft, onSelectWindow }) => {
    return (
        <div className="overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex gap-2 min-w-max px-2 pt-2">
                {windows.map((win, idx) => {
                    const result = ScoringEngine.calculateSuitability(win, profile, { aircraft });
                    const timeLabel = format(win.startTime, 'HH:mm');
                    const dayLabel = format(win.startTime, 'MMM d');
                    const isNewDay = idx === 0 || format(windows[idx - 1].startTime, 'd') !== format(win.startTime, 'd');

                    const barColor =
                        result.status === 'GO' ? 'bg-emerald-500 shadow-sm' :
                            result.status === 'MARGINAL' ? 'bg-amber-500 shadow-sm' :
                                'bg-rose-500 shadow-sm';

                    return (
                        <div key={idx} className="flex flex-col items-center group cursor-pointer" onClick={() => onSelectWindow?.(win)}>
                            {isNewDay ? (
                                <div className="text-xs text-sky-600 mb-2 font-bold sticky left-0 font-display">{dayLabel}</div>
                            ) : <div className="h-6 mb-2"></div>}

                            <div className={clsx("w-6 rounded-t transition-all hover:opacity-100 opacity-80 relative", barColor)} style={{ height: `${Math.max(20, result.score)}px` }}>
                                {/* Tooltip on hover */}
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-white dark:bg-slate-800 p-3 rounded-lg text-xs whitespace-nowrap z-50 w-32 border border-slate-200 dark:border-slate-700 shadow-xl">
                                    <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">{dayLabel} {timeLabel}</div>
                                    <div className="text-slate-500 dark:text-slate-400 text-[10px] space-y-0.5 mb-1">
                                        <div>Wind: <span className="text-slate-700 dark:text-slate-300 font-mono">{win.wind.speed}{win.wind.gust > win.wind.speed + 5 ? `G${win.wind.gust}` : ''}kt</span></div>
                                        <div>Cig: <span className="text-slate-700 dark:text-slate-300 font-mono">{win.ceiling > 20000 ? 'Unlim' : win.ceiling}</span></div>
                                        <div>Vis: <span className="text-slate-700 dark:text-slate-300 font-mono">{win.visibility.toFixed(1)}sm</span></div>
                                    </div>
                                    <div className="text-slate-500 dark:text-slate-400">Score: <span className="text-slate-900 dark:text-slate-100 font-bold">{result.score}</span></div>
                                    <div className={clsx("text-xs font-bold uppercase mt-1",
                                        result.status === 'GO' ? 'text-emerald-600 dark:text-emerald-400' :
                                            result.status === 'NO_GO' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                                    )}>
                                        {result.status}
                                    </div>
                                </div>
                            </div>
                            <div className="text-[10px] text-slate-400 group-hover:text-slate-600 mt-2 rotate-[-45deg] origin-top-left translate-y-4 font-mono">{timeLabel}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
