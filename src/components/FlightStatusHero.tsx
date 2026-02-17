import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { ScoringResult } from '../logic/scoring';

interface FlightStatusHeroProps {
    result: ScoringResult | null;
    className?: string;
}

export const FlightStatusHero = ({ result, className = '' }: FlightStatusHeroProps) => {
    if (!result) return null;

    const isFlyable = result.score > 0;

    // Status Text Configuration
    const statusConfig = {
        flyable: {
            text: "Flyable",
            subtext: "Conditions meet all personal minimums",
            color: "text-[var(--status-flyable)]",
            icon: CheckCircle2
        },
        warning: { // For marginal/mixed if needed in future
            text: "Marginal",
            subtext: "Some personal minimums are close",
            color: "text-[var(--status-warning)]",
            icon: AlertCircle
        },
        noFly: {
            text: "No Fly",
            subtext: "Conditions exceed personal minimums",
            color: "text-[var(--status-nofly)]",
            icon: AlertCircle
        }
    };

    // Simple logic for now: > 0 is flyable (Green), <= 0 is no fly (Red).
    // result.score is typically 1 (Go) or -1 (No Go) in the current logic.
    const config = isFlyable ? statusConfig.flyable : statusConfig.noFly;

    return (
        <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
            <h1 className={`text-6xl sm:text-7xl font-bold tracking-tight mb-3 ${config.color} font-display`}>
                {config.text}
            </h1>

            <div className="flex items-center gap-2 text-slate-500 font-medium text-lg">
                <span className={config.color}>
                    Conditions
                </span>
                <span className="text-slate-400">
                    {isFlyable ? "meet all" : "exceed"}
                </span>
                <span className="text-slate-500">
                    personal minimums
                </span>
            </div>
        </div>
    );
};
