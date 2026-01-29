import { CloudRain, ShieldAlert } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="w-full py-8 mt-12 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center transition-colors">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400 mb-6">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full border border-amber-100 dark:border-amber-900/30">
                        <ShieldAlert className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wide">Not for Navigation</span>
                    </div>
                    <p className="text-xs max-w-lg leading-relaxed">
                        This application is for <strong>simulated flight training and planning purposes only</strong>.
                        Weather data is sourced from <a href="https://aviationweather.gov" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-800 dark:hover:text-slate-200">aviationweather.gov</a>
                        but may be delayed or incomplete. Always obtain a standard briefing from Flight Service (1-800-WX-BRIEF)
                        before any real-world flight operation.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-[10px] text-slate-400 dark:text-slate-600">
                    <p>© {new Date().getFullYear()} FlightSolo. All rights reserved.</p>
                    <span className="hidden md:block">•</span>
                    <p className="flex items-center gap-1">
                        <CloudRain className="w-3 h-3" />
                        Powered by NOAA/NWS Aviation Weather Center
                    </p>
                </div>
            </div>
        </footer>
    );
};
