import React from 'react';
import clsx from 'clsx';

interface WeatherBadgeProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    className?: string;
}

export const WeatherBadge: React.FC<WeatherBadgeProps> = ({ label, value, icon, className }) => {
    return (
        <div className={clsx(
            "glass-panel rounded-xl p-3 flex flex-col items-center justify-center gap-1 transition-all hover:bg-white/5",
            className
        )}>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">{label}</span>
            <div className="flex items-center gap-2">
                {icon && <span className="text-slate-400 opacity-75">{icon}</span>}
                <span className="font-display font-semibold text-xl text-slate-200">{value}</span>
            </div>
        </div>
    );
};
