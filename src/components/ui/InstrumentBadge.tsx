import { clsx } from 'clsx';
import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface InstrumentBadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    className?: string;
    icon?: ReactNode;
}

const VARIANTS = {
    default: "bg-slate-800/50 text-slate-300 border-slate-700",
    neutral: "bg-slate-800/50 text-slate-300 border-slate-700",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]",
    danger: "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(248,113,113,0.1)]",
    info: "bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-[0_0_10px_rgba(56,189,248,0.1)]",
};

export const InstrumentBadge = ({ children, variant = 'default', className, icon }: InstrumentBadgeProps) => {
    return (
        <span
            className={clsx(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border",
                "font-display backdrop-blur-sm",
                VARIANTS[variant],
                className
            )}
        >
            {icon && <span className="w-3 h-3 flex items-center justify-center">{icon}</span>}
            {children}
        </span>
    );
};
