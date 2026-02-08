
import { Mail, HelpCircle, MessageSquare, AlertTriangle } from 'lucide-react';

export const SupportPage = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 text-slate-700 dark:text-slate-300">
            <div className="mb-12 text-center">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Support Center
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Need help with FlightSolo? We're here for you.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Contact Card */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-2xl flex items-center justify-center mb-6">
                        <Mail className="w-8 h-8 text-sky-600 dark:text-sky-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                        Contact Support
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">
                        Found a bug? Have a feature request? Or just want to say hi?
                        Drop us an email.
                    </p>
                    <a 
                        href="mailto:wavesparkinc@gmail.com"
                        className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-sky-500/20"
                    >
                        Email Us
                    </a>
                </div>

                {/* FAQ / Info Card */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center text-center">
                     <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-6">
                        <HelpCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                        Common Questions
                    </h2>
                    <div className="text-left w-full space-y-4 mt-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                Where is my data?
                            </h3>
                            <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">
                                All data is stored locally on your device. If you clear your browser cache, you may lose your settings.
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                             <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-sky-500" />
                                Offline Mode?
                            </h3>
                            <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">
                                The app works offline, but you need an internet connection to fetch fresh weather data.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

             <section className="text-center pt-8 border-t border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 text-sm">
                    Support Email: <a href="mailto:wavesparkinc@gmail.com" className="hover:text-sky-500 underline">wavesparkinc@gmail.com</a>
                </p>
            </section>
        </div>
    );
};
