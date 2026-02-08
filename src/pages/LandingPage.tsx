
import { Link } from 'react-router-dom';
import { 
    CloudSun, 
    Scale, 
    CheckSquare, 
    Wind, 
    ArrowRight, 
    Map as MapIcon, 
    ShieldCheck
} from 'lucide-react';

export const LandingPage = () => {
    return (
        <div className="flex flex-col min-h-[80vh]">
            
            {/* Hero Section */}
            <section className="relative py-20 md:py-32 px-4 overflow-hidden">
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                        </span>
                        v1.0 Now Available
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-display font-bold text-slate-900 dark:text-white mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                        Flight Planning, <br />
                        <span className="bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
                            Reimagined.
                        </span>
                    </h1>
                    
                    <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                        Smart weather briefings, weight & balance, and risk assessment tools designed for the modern pilot. 
                        Go from "thinking" to "flying" in seconds.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
                        <Link 
                            to="/dashboard" 
                            className="w-full sm:w-auto px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white text-lg font-bold rounded-xl transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 group"
                        >
                            Launch App 
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a 
                            href="https://github.com/victorrodriguez/pilotweatherbrief" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-lg font-bold rounded-xl transition-all"
                        >
                            View on GitHub
                        </a>
                    </div>
                </div>
                
                {/* Background Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-4 bg-slate-50/50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-4">Everything you need to Go.</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                            Comprehensive tools packed into a fast, offline-capable interface.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={CloudSun}
                            title="Smart Briefings"
                            description="Real-time METARs and TAFs decoded and scored against your personal minimums."
                            color="text-amber-500"
                            bg="bg-amber-500/10"
                        />
                        <FeatureCard 
                            icon={Scale}
                            title="Weight & Balance"
                            description="Interactive CG envelopes and load planning for your specific aircraft profiles."
                            color="text-emerald-500"
                            bg="bg-emerald-500/10"
                        />
                        <FeatureCard 
                            icon={MapIcon}
                            title="Route Weather"
                            description="Visualize weather conditions along your entire flight path with dynamic mapping."
                            color="text-sky-500"
                            bg="bg-sky-500/10"
                        />
                         <FeatureCard 
                            icon={CheckSquare}
                            title="Smart Checklists"
                            description="Voice-assisted emergency and normal checklists to keep your head in the cockpit."
                            color="text-indigo-500"
                            bg="bg-indigo-500/10"
                        />
                         <FeatureCard 
                            icon={Wind}
                            title="Runway Winds"
                            description="Instant headwind and crosswind component calculations for any runway."
                            color="text-rose-500"
                            bg="bg-rose-500/10"
                        />
                         <FeatureCard 
                            icon={ShieldCheck}
                            title="Offline Ready"
                            description="Built as a PWA. Save to your home screen and access core features even without signal."
                            color="text-slate-500"
                            bg="bg-slate-500/10"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

function FeatureCard({ icon: Icon, title, description, color, bg }: any) {
    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            <div className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center mb-6`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                {description}
            </p>
        </div>
    );
}
