
import { Copy } from 'lucide-react';
import type { WeatherWindow } from '../types/weather';

interface RawWxViewerProps {
    stationId: string;
    weatherData: WeatherWindow[];
}

export const RawWxViewer = ({ stationId, weatherData }: RawWxViewerProps) => {
    // Extract unique raw texts
    const metarWindow = weatherData.find(w => !w.isForecast && w.rawText);
    const tafWindow = weatherData.find(w => w.isForecast && w.rawText);

    const metarText = metarWindow?.rawText;
    const tafText = tafWindow?.rawText;

    if (!metarText && !tafText) return null;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Toast logic could go here
    };

    return (
        <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Raw Station Data ({stationId})</h3>
            <div className="bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-700">

                {/* METAR */}
                {metarText && (
                    <div className="p-4 border-b border-slate-800 relative group">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => copyToClipboard(metarText)}
                                className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded"
                                title="Copy METAR"
                            >
                                <Copy className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="text-[10px] font-bold text-emerald-500 mb-1">METAR (Current)</div>
                        <div className="font-mono text-xs md:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                            {metarText}
                        </div>
                    </div>
                )}

                {/* TAF */}
                {tafText && (
                    <div className="p-4 relative group bg-slate-900">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => copyToClipboard(tafText)}
                                className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded"
                                title="Copy TAF"
                            >
                                <Copy className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="text-[10px] font-bold text-sky-500 mb-1">TAF (Forecast)</div>
                        <div className="font-mono text-xs md:text-sm text-slate-400 leading-relaxed whitespace-pre-wrap break-words">
                            {/* Simple highlighting for FM/BECMG lines could be added here later */}
                            {tafText}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
