
import { Lock, Eye, Database, Mail } from 'lucide-react';

export const PrivacyPolicy = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 text-slate-700 dark:text-slate-300">
            <div className="mb-12 text-center">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Privacy Policy
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Last Updated: February 7, 2026
                </p>
            </div>

            <div className="space-y-12">
                {/* Introduction */}
                <section>
                    <p className="text-lg leading-relaxed">
                        At FlightSolo, we take your privacy seriously. This policy describes how we handle your data. 
                        To put it simply: <strong>We do not collect or store your personal flight data on our servers.</strong>
                    </p>
                </section>

                {/* Local Storage */}
                <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-sky-100 dark:bg-sky-900/30 rounded-lg shrink-0">
                            <Database className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
                                1. Data Storage
                            </h2>
                            <p className="mb-4">
                                FlightSolo operates on a "Local-First" architecture. All critical data, including:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 mb-4">
                                <li>Aircraft Profiles (Performance data, W&B configurations)</li>
                                <li>Pilot Profiles (Personal minimums)</li>
                                <li>Flight Plans and Routes</li>
                                <li>User Settings</li>
                            </ul>
                            <p>
                                ...is stored securely on your local device using <code>localStorage</code>. 
                                We do not transmit this data to any external cloud database. 
                                If you clear your browser cache or delete the app, this data may be lost.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Location Data */}
                <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg shrink-0">
                            <Eye className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
                                2. Location Information
                            </h2>
                            <p>
                                We use your device's location services solely to provide:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li>Nearby airport suggestions</li>
                                <li>Local weather information</li>
                                <li>Map positioning</li>
                            </ul>
                            <p className="mt-4">
                                Your precise location coordinates are processing locally in the browser and are not logged or tracked by us.
                            </p>
                        </div>
                    </div>
                </section>

                {/* External Services */}
                <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg shrink-0">
                            <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
                                3. External Services
                            </h2>
                            <p>
                                To provide accurate aviation data, the app makes ephemeral requests to third-party services:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li><strong>Aviationweather.gov (NOAA)</strong>: For METARs, TAFs, and weather charts.</li>
                                <li><strong>OpenStreetMap</strong>: For map tiles and visual navigation.</li>
                            </ul>
                            <p className="mt-4">
                                These requests are direct from your device to the service provider. We do not act as a middleman for this traffic.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <section className="text-center pt-8 border-t border-slate-200 dark:border-slate-800">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                        Questions?
                    </h2>
                    <p className="mb-6">
                        If you have any questions about this Privacy Policy, please contact us:
                    </p>
                    <a 
                        href="mailto:wavesparkinc@gmail.com"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
                    >
                        <Mail className="w-5 h-5" />
                        wavesparkinc@gmail.com
                    </a>
                </section>
            </div>
        </div>
    );
};
