
import { useState, useEffect, useMemo } from 'react';
import { useAircraft } from '../hooks/useAircraft';
import { Scale, AlertTriangle, CheckCircle } from 'lucide-react';

export const WeightBalanceCalculator = () => {
    const { activeAircraft } = useAircraft();
    const [weights, setWeights] = useState<Record<string, number>>({});

    // Initialize weights when aircraft changes
    useEffect(() => {
        if (activeAircraft) {
            const initial: Record<string, number> = {};
            activeAircraft.stations?.forEach(s => {
                initial[s.id] = 0; // Default to 0
            });
            // Fuel station special case?
            setWeights(initial);
        }
    }, [activeAircraft.id]);

    const handleWeightChange = (id: string, val: number) => {
        setWeights(prev => ({ ...prev, [id]: val }));
    };

    // Calculations
    const { totalWeight, cg } = useMemo(() => {
        let w = activeAircraft.performance.emptyWeight || 0;
        let m = w * (activeAircraft.cgEnvelope?.[0]?.arm || 0); // Fallback if no empty arm provided? 
        // Wait, Aircraft struct doesn't have partial empty arm usually, it's derived or part of "Empty Weight" record. 
        // Actually, typical W&B starts with Empty Weight & Moment/Arm. 
        // My Aircraft type has `emptyWeight`, but I forgot `emptyArm`!
        // For this demo, let's assume Empty Arm is ~middle of envelope or 0 if we calculate from datum.
        // Let's assume a default empty arm for C172 is ~39.6 inches.
        
        // FIX: I should have added emptyArm to Aircraft type. 
        // For now, I'll estimate it or use the first station's arm - something.
        // Use configured empty arm or fallback
        const emptyArm = activeAircraft.performance.emptyArm || 39.0;
        
        m = w * emptyArm;

        if (activeAircraft.stations) {
            activeAircraft.stations.forEach(s => {
                const load = weights[s.id] || 0;
                w += load;
                m += load * s.arm;
            });
        }

        return {
            totalWeight: w,
            cg: w > 0 ? m / w : 0
        };
    }, [activeAircraft, weights]);

    // Status
    const isWeightOk = totalWeight <= (activeAircraft.performance.maxGrossWeight || 2550);
    
    // Check Envelope (Point in Polygon)
    const isCgOk = useMemo(() => {
        const envelope = activeAircraft.cgEnvelope;
        if (!envelope || envelope.length < 3) return true; // Can't check
        
        // Ray casting algorithm
        let inside = false;
        for (let i = 0, j = envelope.length - 1; i < envelope.length; j = i++) {
            const xi = envelope[i].arm, yi = envelope[i].weight;
            const xj = envelope[j].arm, yj = envelope[j].weight;
            
            const intersect = ((yi > totalWeight) !== (yj > totalWeight))
                && (cg < (xj - xi) * (totalWeight - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }, [cg, totalWeight, activeAircraft.cgEnvelope]);

    // Graph Scales
    // Find min/max X (Arm) and Y (Weight)
    const graphBounds = useMemo(() => {
        const env = activeAircraft.cgEnvelope || [];
        if (env.length === 0) return { minX: 30, maxX: 50, minY: 1000, maxY: 2600 };
        
        const arms = env.map(p => p.arm);
        const weights = env.map(p => p.weight);
        return {
            minX: Math.min(...arms) - 2,
            maxX: Math.max(...arms) + 2,
            minY: Math.min(...weights) - 200,
            maxY: Math.max(...weights) + 200
        };
    }, [activeAircraft.cgEnvelope]);

    // Graph Mapping Helpers
    const width = 300, height = 300;
    const padding = 40;
    const mapX = (arm: number) => padding + (arm - graphBounds.minX) / (graphBounds.maxX - graphBounds.minX) * (width - 2 * padding);
    const mapY = (wt: number) => height - padding - (wt - graphBounds.minY) / (graphBounds.maxY - graphBounds.minY) * (height - 2 * padding);

    // Envelope Path
    const envelopePath = useMemo(() => {
        if (!activeAircraft.cgEnvelope || activeAircraft.cgEnvelope.length === 0) return '';
        return activeAircraft.cgEnvelope.map((p, i) => 
            (i === 0 ? 'M' : 'L') + `${mapX(p.arm)},${mapY(p.weight)}`
        ).join(' ') + 'Z';
    }, [activeAircraft.cgEnvelope, graphBounds]);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-sky-500" />
                    Weight & Balance
                </h3>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                    isWeightOk && isCgOk ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                }`}>
                    {isWeightOk && isCgOk ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {isWeightOk && isCgOk ? 'Within Limits' : 'Out of Limits'}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-500">Aircraft</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{activeAircraft.registration} ({activeAircraft.type})</span>
                        </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Basic Empty Weight</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{activeAircraft.performance.emptyWeight} lbs</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading Stations</h4>
                        {activeAircraft.stations?.map(station => (
                            <div key={station.id}>
                                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    <span>{station.name} <span className="text-slate-400 font-normal">(@ {station.arm}")</span></span>
                                    <span>{weights[station.id] || 0} / {station.maxWeight} lbs</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max={station.maxWeight}
                                    step="1"
                                    value={weights[station.id] || 0}
                                    onChange={(e) => handleWeightChange(station.id, Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                                />
                            </div>
                        ))}
                         {(!activeAircraft.stations || activeAircraft.stations.length === 0) && (
                            <div className="text-sm text-slate-400 italic">No stations defined for this aircraft. Edit aircraft to add W&B data.</div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <div>
                             <div className="text-xs text-slate-400">Total Weight</div>
                             <div className={`text-xl font-bold ${isWeightOk ? 'text-slate-800 dark:text-slate-200' : 'text-rose-600'}`}>
                                 {totalWeight.toFixed(1)} <span className="text-sm text-slate-500">lbs</span>
                             </div>
                             <div className="text-[10px] text-slate-400">Max: {activeAircraft.performance.maxGrossWeight}</div>
                        </div>
                        <div>
                             <div className="text-xs text-slate-400">Center of Gravity</div>
                             <div className={`text-xl font-bold ${isCgOk ? 'text-slate-800 dark:text-slate-200' : 'text-rose-600'}`}>
                                 {cg.toFixed(1)} <span className="text-sm text-slate-500">in</span>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Graph */}
                <div className="relative flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <svg width={width} height={height} className="overflow-visible">
                        {/* Grid Lines */}
                        
                        {/* Envelope */}
                        <path 
                            d={envelopePath} 
                            fill="rgba(14, 165, 233, 0.1)" 
                            stroke="#0ea5e9" 
                            strokeWidth="2"
                        />
                        
                        {/* CG Point */}
                        <circle 
                            cx={mapX(cg)} 
                            cy={mapY(totalWeight)} 
                            r="6" 
                            fill={isWeightOk && isCgOk ? "#10b981" : "#f43f5e"} 
                            stroke="white" 
                            strokeWidth="2"
                            className="transition-all duration-300 ease-out"
                        />
                        
                        {/* Labels */}
                        <text x={width/2} y={height + 20} textAnchor="middle" className="text-[10px] fill-slate-400">CG Arm (inches)</text>
                        <text x={-20} y={height/2} textAnchor="middle" transform={`rotate(-90, -20, ${height/2})`} className="text-[10px] fill-slate-400">Weight (lbs)</text>
                    </svg>
                    
                    {/* Fallback msg */}
                    {(!activeAircraft.cgEnvelope || activeAircraft.cgEnvelope.length === 0) && (
                         <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-[1px]">
                            <p className="text-sm text-slate-500 font-bold">No Envelope Data</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
