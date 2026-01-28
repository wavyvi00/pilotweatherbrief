import React from 'react';
import clsx from 'clsx';
import type { SuitabilityResult } from '../logic/scoring';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface SuitabilityCardProps {
    result: SuitabilityResult;
}

export const SuitabilityCard: React.FC<SuitabilityCardProps> = ({ result }) => {
    const { status } = result;

    const statusConfig = {
        GO: {
            // Emerald/Teal for Go
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            text: 'text-emerald-700',
            iconColor: 'text-emerald-600',
            label: 'Good to Fly',
            glow: 'shadow-sm shadow-emerald-500/20'
        },
        MARGINAL: {
            // Amber/Orange for Marginal
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            text: 'text-amber-700',
            iconColor: 'text-amber-600',
            label: 'Marginal Conditions',
            glow: 'shadow-sm shadow-amber-500/20'
        },
        NO_GO: {
            // Rose/Red for No Go
            bg: 'bg-rose-50',
            border: 'border-rose-200',
            text: 'text-rose-700',
            iconColor: 'text-rose-600',
            label: 'No Go',
            glow: 'shadow-sm shadow-rose-500/20'
        }
    };

    const config = statusConfig[status];
    const Icon = status === 'GO' ? CheckCircle : status === 'NO_GO' ? XCircle : AlertTriangle;

    return (
        <div className={clsx(
            "rounded-xl p-5 shadow-lg border transition-all animate-fade-in",
            "bg-white border-slate-200"
        )}>
            {/* Header / Title Row */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={clsx("p-1.5 rounded-full", config.bg)}>
                        <Icon className={clsx("w-5 h-5", config.iconColor)} />
                    </div>
                    <span className="font-display font-bold text-slate-800 tracking-wide text-sm uppercase">FORECAST DETAILS</span>
                </div>
                <div className="p-1 rounded-full hover:bg-slate-100 cursor-help transition-colors text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                </div>
            </div>

            {/* Status & Score */}
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                    <h2 className={clsx("text-xl font-bold font-display", config.text)}>– {config.label}</h2>
                </div>
                <p className="text-xs text-slate-500 font-medium ml-1">
                    Conditions meet all personal minimums for this profile.
                </p>
            </div>

            {/* Data Grid (Mocked for visual match based on reference, normally would pull from result/window) */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs mt-4 pt-4 border-t border-slate-100 bg-slate-50/50 -mx-5 px-5 -mb-5 pb-4 rounded-b-xl">
                <div>
                    <span className="font-bold text-slate-800">WINDS</span> <span className="text-slate-500">350° @ 8 KT</span>
                </div>
                <div>
                    <span className="font-bold text-slate-800">CLOUDS</span> <span className="text-slate-500">UNLIMITED</span>
                </div>
                <div>
                    <span className="font-bold text-slate-800">VISIBILITY</span> <span className="text-slate-500">10SM</span>
                </div>
                <div>
                    <span className="font-bold text-slate-800">TEXT</span> <span className="text-slate-500">10 SM</span>
                </div>
                <div className="col-span-2 flex items-center justify-between pt-1">
                    <span className="font-bold text-slate-800">PRECIPITATION</span> <span className="text-slate-500 uppercase">NONE</span>
                </div>
            </div>

        </div>
    );
};
