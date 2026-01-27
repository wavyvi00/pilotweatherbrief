import React from 'react';
import { format } from 'date-fns';
import type { WeatherWindow } from '../types/weather';
import type { TrainingProfile } from '../types/profile';
import { ScoringEngine } from '../logic/scoring';
import clsx from 'clsx';

interface TimelineChartProps {
    windows: WeatherWindow[];
    profile: TrainingProfile;
    onSelectWindow?: (window: WeatherWindow) => void;
}

export const TimelineChart: React.FC<TimelineChartProps> = ({ windows, profile, onSelectWindow }) => {
    return (
        <div className="overflow-x-auto pb-4">
            <div className="flex gap-2 min-w-max">
                {windows.map((win, idx) => {
                    const result = ScoringEngine.calculateSuitability(win, profile);
                    const timeLabel = format(win.startTime, 'HH:mm');
                    const dayLabel = format(win.startTime, 'MMM d');
                    const isNewDay = idx === 0 || format(windows[idx - 1].startTime, 'd') !== format(win.startTime, 'd');

                    const barColor =
                        result.status === 'GO' ? 'bg-green-500' :
                            result.status === 'MARGINAL' ? 'bg-yellow-500' :
                                'bg-red-500';

                    return (
                        <div key={idx} className="flex flex-col items-center group cursor-pointer" onClick={() => onSelectWindow?.(win)}>
                            {isNewDay && (
                                <div className="text-xs text-muted mb-2 font-bold sticky left-0">{dayLabel}</div>
                            )}
                            <div className={clsx("w-8 rounded-t transition-all hover:opacity-80 relative", barColor)} style={{ height: `${Math.max(20, result.score)}px` }}>
                                {/* Tooltip on hover */}
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-surface border border-slate-600 p-2 rounded text-xs whitespace-nowrap z-10 shadow-xl">
                                    <div className="font-bold">{dayLabel} {timeLabel}</div>
                                    <div>Score: {result.score}</div>
                                    <div className={clsx("text-xs",
                                        result.status === 'GO' ? 'text-green-400' :
                                            result.status === 'NO_GO' ? 'text-red-400' : 'text-yellow-400'
                                    )}>
                                        {result.status}
                                    </div>
                                </div>
                            </div>
                            <div className="text-[10px] text-muted mt-1 rotate-[-45deg] origin-top-left translate-y-4">{timeLabel}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
