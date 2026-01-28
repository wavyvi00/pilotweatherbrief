import React from 'react';
import clsx from 'clsx';
import type { SuitabilityResult } from '../logic/scoring';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

interface SuitabilityCardProps {
    result: SuitabilityResult;
    timeLabel: string;
}

export const SuitabilityCard: React.FC<SuitabilityCardProps> = ({ result, timeLabel }) => {
    const { score, status, reasons } = result;

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
        <GlassCard className={clsx("p-6 transition-all", config.bg, config.border, config.glow)}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                {/* Left Side: Status */}
                <div className="flex items-center gap-4">
                    <Icon className={clsx("w-12 h-12", config.iconColor)} />
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-display">{timeLabel}</h3>
                        <div className={clsx("text-3xl font-bold tracking-tight font-display", config.text)}>
                            {config.label}
                        </div>
                    </div>
                </div>

                {/* Right Side: Score */}
                <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1">
                        <span className={clsx("text-5xl font-bold font-display", config.text)}>{score}</span>
                        <span className="text-slate-500 font-medium">/100</span>
                    </div>
                </div>
            </div>

            {/* Reasons / Details */}
            <div className="mt-6 pt-6 border-t border-slate-100">
                {reasons.length > 0 ? (
                    <div className="space-y-2">
                        {reasons.map((reason, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-sm text-slate-700 bg-slate-100 px-4 py-3 rounded-lg border border-slate-200">
                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                <span className="font-medium">{reason}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center gap-3 text-emerald-700 bg-emerald-50 px-4 py-3 rounded-lg border border-emerald-200">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Conditions meet all personal minimums for this profile.</span>
                    </div>
                )}
            </div>
        </GlassCard>
    );
};
