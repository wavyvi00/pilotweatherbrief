import { ChevronRight, Settings } from 'lucide-react';
import type { Aircraft } from '../types/aircraft';
import type { TrainingProfile } from '../types/profile';
import clsx from 'clsx';

interface DashboardHeaderProps {
    stationId: string;
    onStationClick?: () => void; // Optional now
    searchMode: 'single' | 'route';
    setSearchMode: (mode: 'single' | 'route') => void;
    activeProfile: TrainingProfile;
    activeAircraft: Aircraft | undefined;
}

export const DashboardHeader = ({
    stationId,
    onStationClick,
    searchMode,
    setSearchMode,
    activeProfile,
    activeAircraft
}: DashboardHeaderProps) => {

    return (
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 gap-4">
            {/* Left: Identifier & Context */}
            <div className="flex flex-col">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-1">
                    <span className="uppercase tracking-wider text-xs">Overview</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-slate-600 font-bold">{searchMode === 'single' ? 'Station' : 'Route'}</span>
                </div>

                <div className="flex items-baseline gap-2">
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight font-display">
                        {stationId}
                    </h1>
                </div>
            </div>

            {/* Right: Context Controls */}
            <div className="flex items-center gap-4 sm:gap-6 text-sm font-medium">
                {/* Aircraft Bubble */}
                {activeAircraft && (
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 shadow-sm">
                        <span className="text-slate-400 text-xs uppercase tracking-wide">Aircraft</span>
                        <span className="font-semibold text-slate-900">{activeAircraft.registration}</span>
                    </div>
                )}

                <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>

                {/* Station / Route Switcher (Segmented Control) */}
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/60 shadow-sm">
                    <button
                        onClick={() => setSearchMode('single')}
                        className={clsx(
                            "px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ease-out",
                            searchMode === 'single'
                                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 font-bold"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                        )}
                    >
                        Station
                    </button>
                    <button
                        onClick={() => setSearchMode('route')}
                        className={clsx(
                            "px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ease-out",
                            searchMode === 'route'
                                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 font-bold"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                        )}
                    >
                        Route
                    </button>
                </div>
            </div>
        </header>
    );
};
