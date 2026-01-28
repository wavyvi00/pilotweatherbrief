import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassCard = ({ children, className, hoverEffect = true }: GlassCardProps) => {
  return (
    <div
      className={clsx(
        "glass-card rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden",
        hoverEffect && "hover:border-sky-500/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300",
        className
      )}
    >
      {/* Subtle top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/50" />

      {children}
    </div>
  );
};
