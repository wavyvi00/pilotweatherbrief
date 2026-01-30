
import { useState, useEffect } from 'react';
import { Wind, ArrowUp, ArrowRight, ArrowLeft, Loader, ChevronDown } from 'lucide-react';
import { useRunways } from '../hooks/useRunways';


interface RunwayWindCalculatorProps {
    wind: {
        direction: number;
        speed: number;
        gust?: number;
    };
    stationId: string;
}

export const RunwayWindCalculator = ({ wind, stationId }: RunwayWindCalculatorProps) => {
    const [runway, setRunway] = useState<string>('');
    const [manualMode, setManualMode] = useState(false);
    const { runways, loading, error } = useRunways(stationId);

    // Reset runway selection when airport changes
    useEffect(() => {
        setRunway('');
        setManualMode(false);
    }, [stationId]);

    // Parse runway heading (e.g. "27" -> 270, "27L" -> 270)
    const runwayNumber = runway.replace(/[LRC]/gi, '');
    let runwayHeading = parseInt(runwayNumber) * 10;
    if (isNaN(runwayHeading)) runwayHeading = 0;

    // Calculate components
    const angleDiff = (wind.direction - runwayHeading + 360) % 360;
    const angleRad = (angleDiff * Math.PI) / 180;

    const headwind = Math.round(wind.speed * Math.cos(angleRad));
    const crosswind = Math.round(wind.speed * Math.sin(angleRad));
    const isHeadwind = headwind >= 0;
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

                    {loading ? (
                        <div className="w-20 h-8 flex items-center justify-center">
                            <Loader className="w-4 h-4 text-slate-400 animate-spin" />
                        </div>
                    ) : manualMode || runways.length === 0 ? (
                        // Manual input fallback
                        <input
                            type="text"
                            placeholder="XX"
                            className="w-16 text-center border border-slate-300 dark:border-slate-600 rounded font-mono font-bold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-sky-500 outline-none transition-colors uppercase"
                            value={runway}
                            onChange={(e) => {
                                const val = e.target.value.toUpperCase();
                                if (val.length <= 3) setRunway(val);
                            }}
                        />
                    ) : (
                        // Dropdown of actual runways
                        <div className="relative">
                            <select
                                value={runway}
                                onChange={(e) => setRunway(e.target.value)}
                                className="appearance-none w-20 text-center border border-slate-300 dark:border-slate-600 rounded font-mono font-bold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer transition-colors pr-6 py-1"
                            >
                                <option value="">--</option>
                                {runways.map(rwy => (
                                    <option key={rwy} value={rwy}>{rwy}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-1.5 top-2 w-3 h-3 text-slate-400 pointer-events-none" />
                        </div>
                    )}

                    {/* Toggle for manual entry */}
                    {runways.length > 0 && !loading && (
                        <button
                            onClick={() => {
                                setManualMode(!manualMode);
                                setRunway('');
                            }}
                            className="text-[10px] text-slate-400 hover:text-sky-500 underline"
                        >
                            {manualMode ? 'List' : 'Manual'}
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <p className="text-xs text-amber-500 mb-2">{error} - Using manual entry</p>
            )}

            {runway && runway.length >= 1 ? (
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    {/* Visualizer */}
                    <div className="relative w-32 h-32 bg-slate-50 dark:bg-slate-900/50 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        <div className="absolute w-4 h-28 bg-slate-800 dark:bg-slate-600 rounded-sm"></div>
                        <div className="absolute bottom-2 text-[10px] font-bold text-white z-10">{runway}</div>
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
                    {runways.length > 0
                        ? 'Select a runway to calculate wind components.'
                        : 'Enter runway number (e.g. 27) to calculate components.'}
                </div>
            )}
        </div>
    );
};
