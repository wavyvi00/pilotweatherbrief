import React from 'react';
import { X, Shield, FileText } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-h-[80vh] flex flex-col animate-fade-in border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-50 dark:bg-sky-900/30 rounded-lg text-sky-600 dark:text-sky-400">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">Privacy Policy</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    <p><strong>Last Updated: January 29, 2026</strong></p>
                    <p>Welcome to FlightSolo. Your privacy is important to us.</p>

                    <h3>1. Data We Collect</h3>
                    <p>We do not collect personal identifiable information (PII) unless explicitly provided (e.g., account registration). We store local preferences (aircraft profiles, theme settings) on your device using LocalStorage.</p>

                    <h3>2. Third-Party Services</h3>
                    <p>We use AviationWeather.gov for METAR/TAF data. Your IP address may be visible to their servers when fetching weather data directly or via our proxy.</p>

                    <h3>3. Location Data</h3>
                    <p>If you enable "Use My Location", your coordinates are processed locally to fetch relevant weather stations. We do not store your location history.</p>

                    <h3>4. Cookie Policy</h3>
                    <p>We use essential cookies/local storage for app functionality (maintaining session state). No tracking cookies are used.</p>

                    <h3>5. Changes</h3>
                    <p>We may update this policy periodically. Continued use of the app implies acceptance.</p>
                </div>
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl flex justify-end">
                    <button onClick={onClose} className="px-5 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};


export const TermsOfServiceModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-h-[80vh] flex flex-col animate-fade-in border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">Terms of Service</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800 mb-6">
                        <strong className="text-amber-800 dark:text-amber-400 uppercase text-xs tracking-wider block mb-1">Critical Warning</strong>
                        <p className="m-0 text-amber-700 dark:text-amber-300 font-bold">This application is for simulation and training purposes only. Do not use for real-world flight planning or navigation.</p>
                    </div>

                    <h3>1. Acceptance</h3>
                    <p>By using FlightSolo, you agree to these terms. If you do not agree, strictly do not use the application.</p>

                    <h3>2. No Liability</h3>
                    <p>The developer(s) of FlightSolo assume <strong>no liability</strong> for any damages, incidents, or accidents resulting from the use of this software. Data is provided "as-is" from third-party sources (NOAA/AviationWeather.gov) and may be delayed or inaccurate.</p>

                    <h3>3. Official Briefings</h3>
                    <p>Pilots in Command (PIC) must always obtain a standard briefing from official sources (e.g., 1800wxbrief.com) prior to any flight.</p>

                    <h3>4. User Conduct</h3>
                    <p>You agree not to misuse the API, attempt to disrupt the service, or reverse engineer the application code.</p>
                </div>
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl flex justify-end">
                    <button onClick={onClose} className="px-5 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors">
                        I Understand & Agree
                    </button>
                </div>
            </div>
        </div>
    );
};
