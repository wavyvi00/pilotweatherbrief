import { useState, useEffect } from 'react';
import { AviationWeatherService } from '../services/weather';
import type { Notam } from '../types/weather';
import { Loader, AlertTriangle, Info, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface NotamViewerProps {
    stationId: string;
}

export const NotamViewer = ({ stationId }: NotamViewerProps) => {
    const [notams, setNotams] = useState<Notam[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const fetchNotams = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await AviationWeatherService.getNotams(stationId);
                if (mounted) {
                    // Sort by start date, most recent first
                    const sorted = data.sort((a, b) => {
                        const dateA = a.startDate ? new Date(a.startDate).getTime() : new Date(a.date).getTime();
                        const dateB = b.startDate ? new Date(b.startDate).getTime() : new Date(b.date).getTime();
                        return dateB - dateA;
                    });
                    setNotams(sorted);
                }
            } catch (err) {
                if (mounted) setError('Failed to load NOTAMs');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        if (stationId) {
            fetchNotams();
        }

        return () => { mounted = false; };
    }, [stationId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12 text-slate-400">
                <Loader className="w-6 h-6 animate-spin" />
                <span className="ml-2 text-sm">Loading NOTAMs...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center gap-2 text-red-400 bg-red-900/10 p-4 rounded-lg">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    if (notams.length === 0) {
        return (
            <div className="flex items-center gap-2 text-slate-500 p-4 bg-slate-50/50 rounded-lg border border-slate-100 italic">
                <Info className="w-5 h-5" />
                <p className="text-sm">No active NOTAMs found for {stationId}.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                {notams.length} Active Notice{notams.length !== 1 ? 's' : ''} for {stationId}
            </h3>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                {notams.map((notam) => (
                    <div key={notam.id} className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md p-3 shadow-sm text-sm hover:border-slate-300 dark:hover:border-slate-500 transition-colors">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex-shrink-0">
                                {notam.text?.includes('RWY') || notam.text?.includes('RUNWAY') || notam.text?.includes('RWY') ? (
                                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" title="Runway Related" />
                                ) : (
                                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5" />
                                )}
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap break-words">
                                    {notam.text}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-400 mt-2 border-t border-slate-100 dark:border-slate-600 pt-2">
                                    <span className="flex items-center gap-1">
                                        <Info className="w-3 h-3" />
                                        {notam.type}
                                    </span>
                                    {(notam.startDate || notam.date) && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {format(new Date(notam.startDate || notam.date), 'dd MMM HH:mm')}
                                            {notam.endDate && <><ArrowRight className="w-3 h-3 mx-1 inline text-slate-300 dark:text-slate-500" />{format(new Date(notam.endDate), 'dd MMM HH:mm')}</>}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
