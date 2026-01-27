import React from 'react';
import clsx from 'clsx';
import type { SuitabilityResult } from '../logic/scoring';
import { AlertTriangle, CheckCircle, XCircle, Wind, Cloud, Eye, Thermometer } from 'lucide-react';

interface SuitabilityCardProps {
    result: SuitabilityResult;
    timeLabel: string;
}

export const SuitabilityCard: React.FC<SuitabilityCardProps> = ({ result, timeLabel }) => {
    const { score, status, reasons } = result;

    const statusConfig = {
        GO: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            text: 'text-emerald-700',
            iconColor: 'text-emerald-500',
            label: 'Good to Fly'
        },
        MARGINAL: {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            text: 'text-amber-700',
            iconColor: 'text-amber-500',
            label: 'Marginal Conditions'
        },
        NO_GO: {
            bg: 'bg-rose-50',
            border: 'border-rose-200',
            text: 'text-rose-700',
            iconColor: 'text-rose-500',
            label: 'No Go'
        }
    };

    const config = statusConfig[status];
    const Icon = status === 'GO' ? CheckCircle : status === 'NO_GO' ? XCircle : AlertTriangle;

    return (
        <div className={clsx("rounded-xl border p-6 shadow-sm transition-all", config.bg, config.border)}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                {/* Left Side: Status */}
                <div className="flex items-center gap-4">
                    <Icon className={clsx("w-12 h-12", config.iconColor)} />
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">{timeLabel}</h3>
                        <div className={clsx("text-3xl font-bold tracking-tight", config.text)}>
                            {config.label}
                        </div>
                    </div>
                </div>

                {/* Right Side: Score */}
                <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1">
                        <span className={clsx("text-5xl font-bold", config.text)}>{score}</span>
                        <span className="text-slate-400 font-medium">/100</span>
                    </div>
                </div>
            </div>

            {/* Reasons / Details */}
            <div className="mt-6 pt-6 border-t border-slate-200/60">
                {reasons.length > 0 ? (
                    <div className="space-y-2">
                        {reasons.map((reason, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-slate-700 bg-white/60 px-3 py-2 rounded-lg border border-slate-100">
                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                <span>{reason}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-100/50 px-3 py-2 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                        <span>Conditions meet all personal minimums for this profile.</span>
                    </div>
                )}
            </div>
        </div>
    );
};
