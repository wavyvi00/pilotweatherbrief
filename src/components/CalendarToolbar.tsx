
import React from 'react';
import type { ToolbarProps } from 'react-big-calendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export const CalendarToolbar: React.FC<ToolbarProps<any, object>> = (props) => {
    const { label, onNavigate } = props;

    const navigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
        onNavigate(action);
    };

    return (
        <div className="flex items-center justify-between mb-6 px-1">
            {/* Left: Current Date Detail (e.g. JAN 28, 12:00 AM) - Placeholder for now or Context */}
            <div className="flex items-center gap-2">
                {/* This section usually holds the active selection context in the reference image */}
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                    {format(new Date(), 'MMM d, h:mm a')}
                </span>
            </div>

            {/* Center: Navigation */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('PREV')}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <span className="text-lg font-bold text-slate-800 tracking-tight">
                    {label}
                </span>

                <button
                    onClick={() => navigate('NEXT')}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Right: View Toggles (Hidden if not needed, as reference shows Month/Week/Day) */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
                <button onClick={() => navigate('TODAY')} className="px-3 py-1 text-sm font-bold text-slate-600 hover:text-slate-900">
                    Today
                </button>
            </div>
        </div>
    );
};
