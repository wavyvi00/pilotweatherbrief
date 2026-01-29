
import { useState } from 'react';
import { Wind, ArrowUp, ArrowRight, ArrowLeft } from 'lucide-react';


interface RunwayWindCalculatorProps {
    wind: {
        direction: number;
        speed: number;
        gust?: number;
    };
}

export const RunwayWindCalculator = ({ wind }: RunwayWindCalculatorProps) => {
    const [runway, setRunway] = useState<string>('');

    // Parse runway heading (e.g. "27" -> 270)
    let runwayHeading = parseInt(runway) * 10;
    if (isNaN(runwayHeading)) runwayHeading = 0;

    // Calculate components
    // Theta = |WindDir - RunwayDir| (adjusted to 0-180 range usually)
    const angleDiff = (wind.direction - runwayHeading + 360) % 360;
    const angleRad = (angleDiff * Math.PI) / 180;

    // Headwind = Speed * cos(diff)
    // Crosswind = Speed * sin(diff)
    const headwind = Math.round(wind.speed * Math.cos(angleRad)); // + is head, - is tail
    const crosswind = Math.round(wind.speed * Math.sin(angleRad)); // + is right to left?, we display ABS

    const isHeadwind = headwind >= 0;


    // Crosswind Direction logic
    // If wind is 300 and runway is 360 (Diff -60 or 300). 
    // This is wind from the LEFT. 
    // Simple logic:
    // (Wind - Runway + 360) % 360.
    // 0-180: Wind from Right. 
    // 180-360: Wind from Left.
    const isWindFromRight = angleDiff > 0 && angleDiff < 180;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mt-4 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                    <Wind className="w-5 h-5 text-sky-500" />
                    <span>Runway Winds</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Runway</span>
                    <input
                        type="number"
                        placeholder="XX"
                        className="w-12 text-center border border-slate-300 dark:border-slate-600 rounded font-mono font-bold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-sky-500 outline-none transition-colors"
                        value={runway}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val.length <= 2) setRunway(val);
                        }}
                    />
                </div>
            </div>

            {runway && runway.length >= 1 ? (
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    {/* Visualizer (Simple SVG) */}
                    <div className="relative w-32 h-32 bg-slate-50 dark:bg-slate-900/50 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        {/* Runway Strip */}
                        <div className="absolute w-4 h-28 bg-slate-800 dark:bg-slate-600 rounded-sm"></div>
                        <div className="absolute bottom-2 text-[10px] font-bold text-white z-10">{runway}</div>
                        {/* Wind Arrow */}
                        <div
                            className="absolute w-1 h-20 bg-transparent flex flex-col justify-end items-center origin-top"
                            style={{
                                transform: `rotate(${angleDiff}deg)`,
                                top: '50%',
                                height: '50%'
                            }}
                        >
                            {/* Wind Vector */}
                        </div>
                        {/* Correct Visual: Wind Arrow blowing ONTO the runway center */}
                        <div
                            className="absolute w-full h-full flex justify-center items-center"
                            style={{ transform: `rotate(${angleDiff + 180}deg)` }}
                        >
                            <ArrowUp className="w-6 h-6 text-sky-500 animate-pulse" />
                        </div>
                    </div>

                    {/* Data Display */}
                    <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col items-center">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                                {isHeadwind ? 'Headwind' : 'Tailwind'}
                            </span>
                            <div className={`text-2xl font-bold font-mono ${isHeadwind ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {Math.abs(headwind)}
                                <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-1">kt</span>
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col items-center">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 flex items-center gap-1">
                                Crosswind
                                {Math.abs(crosswind) > 0 && (isWindFromRight ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />)}
                            </span>
                            <div className={`text-2xl font-bold font-mono ${Math.abs(crosswind) > 12 ? 'text-amber-500' : 'text-slate-700 dark:text-slate-200'}`}>
                                {Math.abs(crosswind)}
                                <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-1">kt</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center text-xs text-slate-400 dark:text-slate-500 py-4 italic">
                    Enter runway number (e.g. 27) to calculate components.
                </div>
            )}
        </div>
    );
};
