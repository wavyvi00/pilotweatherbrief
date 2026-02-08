
import { Link } from 'react-router-dom';
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
    return (
        <div className="flex flex-col min-h-[80vh] bg-slate-900 text-slate-100 selection:bg-emerald-500/30">
            
            {/* Hero Section - HUD/Cockpit Style */}
            <section className="relative py-24 md:py-40 px-4 overflow-hidden">
                
                {/* Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none"></div>
                
                {/* Radar Sweep Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-emerald-500/10 [mask-image:linear-gradient(transparent,black)] animate-[spin_10s_linear_infinite] pointer-events-none opacity-20">
                    <div className="h-1/2 w-full bg-gradient-to-t from-emerald-500/20 to-transparent"></div>
                </div>

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-emerald-500/30 bg-emerald-900/20 text-emerald-400 text-xs font-mono tracking-widest uppercase mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Target className="w-3 h-3" />
                        System Online • v1.0
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-mono font-bold text-white mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        FLIGHT<span className="text-emerald-500">SOLO</span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 font-light">
                        Precision flight planning tools. <br/>
                        <span className="text-emerald-400 font-mono">Weather. Balance. Risk.</span>
                    </p>
                    
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

            {/* Cloud Parallax Transition */}
            <div className="relative h-48 md:h-64 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800/50 to-slate-950">
                {/* Cloud Layer 1 - Back */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="absolute w-[200%] h-full flex gap-8 animate-[slide_30s_linear_infinite]">
                        {[...Array(8)].map((_, i) => (
                            <div 
                                key={`cloud-back-${i}`}
                                className="flex-shrink-0 w-64 h-24 bg-white/5 rounded-full blur-2xl"
                                style={{ 
                                    transform: `translateY(${Math.sin(i * 0.8) * 20}px)`,
                                    opacity: 0.3 + Math.random() * 0.2 
                                }}
                            />
                        ))}
                    </div>
                </div>
                
                {/* Cloud Layer 2 - Mid */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="absolute w-[200%] h-full flex gap-12 animate-[slide_20s_linear_infinite]">
                        {[...Array(6)].map((_, i) => (
                            <div 
                                key={`cloud-mid-${i}`}
                                className="flex-shrink-0 w-80 h-32 bg-white/10 rounded-full blur-xl"
                                style={{ 
                                    transform: `translateY(${Math.cos(i * 1.2) * 15}px)`,
                                    opacity: 0.4 + Math.random() * 0.2 
                                }}
                            />
                        ))}
                    </div>
                </div>
                
                {/* Cloud Layer 3 - Front */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="absolute w-[200%] h-full flex gap-16 animate-[slide_12s_linear_infinite]">
                        {[...Array(5)].map((_, i) => (
                            <div 
                                key={`cloud-front-${i}`}
                                className="flex-shrink-0 w-96 h-40 bg-white/15 rounded-full blur-lg"
                                style={{ 
                                    transform: `translateY(${Math.sin(i * 0.5) * 10}px)`,
                                    opacity: 0.5 + Math.random() * 0.2 
                                }}
                            />
                        ))}
                    </div>
                </div>
                
                {/* Fog overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent"></div>
                
                {/* Center glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Features Grid - Technical/Dark */}
            <section className="py-20 px-4 bg-slate-950">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl font-mono font-bold text-emerald-500 mb-4 tracking-wider uppercase">Mission Capabilities</h2>
                        <div className="h-0.5 w-24 bg-emerald-500/30 mx-auto"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <TechCard 
                            icon={CloudSun}
                            title="Smart Briefings"
                            description="Live METAR/TAF decoding with personal minimums scoring."
                        />
                        <TechCard 
                            icon={Scale}
                            title="Weight & Balance"
                            description="Dynamic CG envelopes with multi-station load planning."
                        />
                        <TechCard 
                            icon={MapIcon}
                            title="Route Visualization"
                            description="Interactive weather mapping along your flight path."
                        />
                         <TechCard 
                            icon={CheckSquare}
                            title="Voice Checklists"
                            description="Audible callouts for hands-free cockpit operations."
                        />
                         <TechCard 
                            icon={Wind}
                            title="Wind Components"
                            description="Instant headwind/crosswind calculations for any runway."
                        />
                         <TechCard 
                            icon={ShieldCheck}
                            title="Offline Capable"
                            description="Fully functional PWA. Data persists without connection."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

function TechCard({ icon: Icon, title, description }: any) {
    return (
        <div className="bg-slate-900 p-6 border border-slate-800 hover:border-emerald-500/50 transition-colors group relative overflow-hidden">
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
