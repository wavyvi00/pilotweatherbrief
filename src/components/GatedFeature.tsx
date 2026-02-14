import type { ReactNode } from 'react';
import { useRevenueCat } from '../contexts/RevenueCatContext';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GatedFeatureProps {
    children: ReactNode;
    fallback?: ReactNode; // Optional custom fallback
    blur?: boolean; // If true, shows blurred content underneath
}

export const GatedFeature = ({ children, fallback, blur = true }: GatedFeatureProps) => {
    const { isPro } = useRevenueCat();

    if (isPro) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            {/* Blurred Content (if enabled) */}
            <div className={blur ? "blur-sm pointer-events-none opacity-50 p-4 select-none" : "hidden"}>
                {children}
            </div>

            {/* Lock Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/60 dark:bg-slate-900/60 backdrop-blur-[2px] z-10 p-6 text-center">
                <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-sky-500/30">
                    <Lock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    Pro Feature
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 max-w-xs">
                    Upgrade to FlightSolo Pro to unlock this feature and more.
                </p>
                <Link
                    to="/subscription"
                    className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-md transition-colors"
                >
                    Unlock Now
                </Link>
            </div>
        </div>
    );
};
