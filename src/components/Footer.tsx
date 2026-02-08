import { Link } from 'react-router-dom';
import { CloudSun } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="w-full py-8 mt-12 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center transition-colors">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
                    <CloudSun className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <span className="font-display font-bold text-slate-600 dark:text-slate-400">FlightSolo</span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-lg mx-auto leading-relaxed mb-6">
                    Weather data provided by NOAA/AviationWeather.gov.
                    <br />
                    <span className="font-bold text-amber-500/80 dark:text-amber-500/60 uppercase tracking-widest text-[10px]">Not for Navigation</span>
                </p>
                <div className="flex items-center justify-center gap-6 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <Link to="/privacy" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">Privacy Policy</Link>
                    <Link to="/support" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">Support</Link>
                    <a href="https://github.com/victorrodriguez/pilotweatherbrief" target="_blank" rel="noopener noreferrer" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">GitHub</a>
                </div>
                <div className="mt-6 text-[10px] text-slate-300 dark:text-slate-600">
                    © {new Date().getFullYear()} FlightSolo. All rights reserved.
                </div>
            </div>
        </footer>
    );
};
