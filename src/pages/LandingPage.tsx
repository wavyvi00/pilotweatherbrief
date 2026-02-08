
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
    CloudSun, 
    Scale, 
    CheckSquare, 
    Wind, 
    Map as MapIcon, 
    ShieldCheck,
    Plane,
    Sparkles
} from 'lucide-react';

export const LandingPage = () => {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="flex flex-col min-h-[80vh] selection:bg-sky-500/30">
            
            {/* Hero Section with Parallax */}
            <section className="relative py-24 md:py-40 px-4 overflow-hidden">
                
                {/* Grid Background - Slow Parallax */}
                <div 
                    className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(14,165,233,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none"
                    style={{ transform: `translateY(${scrollY * 0.1}px)` }}
                ></div>
                
                {/* Gradient Orb - Medium Parallax */}
                <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-sky-500/20 via-indigo-500/10 to-orange-500/10 dark:from-sky-500/30 dark:via-indigo-500/20 dark:to-orange-500/15 rounded-full blur-3xl pointer-events-none"
                    style={{ transform: `translate(-50%, calc(-50% + ${scrollY * 0.15}px))` }}
                ></div>

                {/* Floating Orbs - Fast Parallax */}
                <div 
                    className="absolute top-20 left-[10%] w-64 h-64 bg-sky-400/10 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none"
                    style={{ transform: `translateY(${scrollY * 0.4}px)` }}
                ></div>
                <div 
                    className="absolute bottom-10 right-[15%] w-48 h-48 bg-indigo-400/10 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"
                    style={{ transform: `translateY(${scrollY * -0.3}px)` }}
                ></div>

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    {/* Status Badge */}
                    <div 
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 dark:bg-sky-500/20 border border-sky-500/20 dark:border-sky-500/30 text-sky-600 dark:text-sky-400 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
                        style={{ transform: `translateY(${scrollY * -0.15}px)` }}
                    >
                        <Sparkles className="w-4 h-4" />
                        Now Available
                    </div>
                    
                    {/* Title */}
                    <h1 
                        className="text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100"
                        style={{ transform: `translateY(${scrollY * -0.1}px)` }}
                    >
                        <span className="text-slate-800 dark:text-white">Flight Planning,</span>
                        <br />
                        <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-sky-500 bg-clip-text text-transparent">
                            Reimagined.
                        </span>
                    </h1>
                    
                    {/* Subtitle */}
                    <p 
                        className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200"
                        style={{ transform: `translateY(${scrollY * -0.05}px)` }}
                    >
                        Smart weather briefings, weight & balance, and risk assessment tools designed for the modern pilot.
                    </p>
                    
                    {/* CTA Button */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
                        <Link 
                            to="/dashboard" 
                            className="group w-full sm:w-auto px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white text-lg font-bold rounded-xl transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-3"
                        >
                            <Plane className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-300" />
                            Launch App
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-4 bg-slate-100/50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 relative overflow-hidden">
                {/* Subtle parallax background */}
                <div 
                    className="absolute inset-0 bg-gradient-to-b from-white/50 dark:from-slate-950/50 to-transparent pointer-events-none"
                    style={{ transform: `translateY(${(scrollY - 400) * 0.05}px)` }}
                ></div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-white mb-4">
                            Everything you need to <span className="text-sky-500">Go.</span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                            Comprehensive tools packed into a fast, offline-capable interface.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
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
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center mb-6`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                {description}
            </p>
        </div>
    );
}
