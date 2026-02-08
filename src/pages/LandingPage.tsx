
import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { 
    CloudSun, 
    Scale, 
    CheckSquare, 
    Wind, 
    Map as MapIcon, 
    ShieldCheck,
    Plane,
    Target
} from 'lucide-react';

export const LandingPage = () => {
    const [scrollY, setScrollY] = useState(0);
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="flex flex-col min-h-[80vh] bg-slate-900 text-slate-100 selection:bg-emerald-500/30 overflow-hidden">
            
            {/* Hero Section - HUD/Cockpit Style with Parallax */}
            <section ref={heroRef} className="relative py-24 md:py-40 px-4 overflow-hidden">
                
                {/* Grid Background - Slow Parallax */}
                <div 
                    className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none"
                    style={{ transform: `translateY(${scrollY * 0.1}px)` }}
                ></div>
                
                {/* Radar Sweep Effect - Medium Parallax */}
                <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-emerald-500/10 [mask-image:linear-gradient(transparent,black)] animate-[spin_10s_linear_infinite] pointer-events-none opacity-20"
                    style={{ transform: `translate(-50%, calc(-50% + ${scrollY * 0.2}px))` }}
                >
                    <div className="h-1/2 w-full bg-gradient-to-t from-emerald-500/20 to-transparent"></div>
                </div>

                {/* Floating Orbs - Fast Parallax */}
                <div 
                    className="absolute top-20 left-[10%] w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"
                    style={{ transform: `translateY(${scrollY * 0.4}px)` }}
                ></div>
                <div 
                    className="absolute bottom-10 right-[15%] w-48 h-48 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"
                    style={{ transform: `translateY(${scrollY * -0.3}px)` }}
                ></div>

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    {/* Status Badge - Slight upward parallax */}
                    <div 
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-emerald-500/30 bg-emerald-900/20 text-emerald-400 text-xs font-mono tracking-widest uppercase mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
                        style={{ transform: `translateY(${scrollY * -0.15}px)` }}
                    >
                        <Target className="w-3 h-3" />
                        System Online • v1.0
                    </div>
                    
                    {/* Title - Slower parallax for depth */}
                    <h1 
                        className="text-5xl md:text-7xl font-mono font-bold text-white mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        style={{ transform: `translateY(${scrollY * -0.1}px)` }}
                    >
                        FLIGHT<span className="text-emerald-500">SOLO</span>
                    </h1>
                    
                    {/* Subtitle - Even slower for more depth */}
                    <p 
                        className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 font-light"
                        style={{ transform: `translateY(${scrollY * -0.05}px)` }}
                    >
                        Precision flight planning tools. <br/>
                        <span className="text-emerald-400 font-mono">Weather. Balance. Risk.</span>
                    </p>
                    
                    {/* CTA Button - Static for user interaction */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
                        <Link 
                            to="/dashboard" 
                            className="group relative w-full sm:w-auto px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-bold tracking-wide transition-all clip-path-slant flex items-center justify-center gap-3 overflow-hidden"
                            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 20%)' }}
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <Plane className="w-5 h-5 group-hover:-rotate-45 transition-transform duration-300" />
                            INITIATE FLIGHT
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid - Technical/Dark */}
            <section className="py-20 px-4 bg-slate-950 border-t border-slate-800 relative overflow-hidden">
                {/* Subtle parallax background for features section */}
                <div 
                    className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-transparent pointer-events-none"
                    style={{ transform: `translateY(${(scrollY - 400) * 0.05}px)` }}
                ></div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl font-mono font-bold text-emerald-500 mb-4 tracking-wider uppercase">Mission Capabilities</h2>
                        <div className="h-0.5 w-24 bg-emerald-500/30 mx-auto"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <TechCard 
                            icon={CloudSun}
                            title="Smart Briefings"
                            description="Live METAR/TAF decoding with personal minimums scoring."
                            delay={0}
                        />
                        <TechCard 
                            icon={Scale}
                            title="Weight & Balance"
                            description="Dynamic CG envelopes with multi-station load planning."
                            delay={1}
                        />
                        <TechCard 
                            icon={MapIcon}
                            title="Route Visualization"
                            description="Interactive weather mapping along your flight path."
                            delay={2}
                        />
                         <TechCard 
                            icon={CheckSquare}
                            title="Voice Checklists"
                            description="Audible callouts for hands-free cockpit operations."
                            delay={3}
                        />
                         <TechCard 
                            icon={Wind}
                            title="Wind Components"
                            description="Instant headwind/crosswind calculations for any runway."
                            delay={4}
                        />
                         <TechCard 
                            icon={ShieldCheck}
                            title="Offline Capable"
                            description="Fully functional PWA. Data persists without connection."
                            delay={5}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

function TechCard({ icon: Icon, title, description, delay }: any) {
    return (
        <div 
            className="bg-slate-900 p-6 border border-slate-800 hover:border-emerald-500/50 transition-all duration-500 group relative overflow-hidden hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-500/5"
            style={{ animationDelay: `${delay * 100}ms` }}
        >
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-slate-700 group-hover:border-emerald-500 transition-colors"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-slate-700 group-hover:border-emerald-500 transition-colors"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-slate-700 group-hover:border-emerald-500 transition-colors"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-slate-700 group-hover:border-emerald-500 transition-colors"></div>

            <div className="mb-4 text-emerald-500/50 group-hover:text-emerald-400 transition-colors">
                <Icon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-mono font-bold text-slate-200 mb-2 group-hover:text-emerald-400 transition-colors">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed border-l-2 border-slate-800 pl-3 group-hover:border-emerald-500/30 transition-colors">
                {description}
            </p>
        </div>
    );
}
