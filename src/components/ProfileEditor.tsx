import React from 'react';
import { type TrainingProfile, type TrainingLimits } from '../types/profile';
import { Wind, Eye, CloudRain, Cloud, AlertTriangle } from 'lucide-react';


interface ProfileEditorProps {
    profile: TrainingProfile;
    onUpdate: (updatedProfile: TrainingProfile) => void;
    onReset?: () => void;
}

const LimitInput = ({
    label,
    value,
    unit,
    onChange,
    icon: Icon,
    step = 1,
    min = 0,
    max = 10000
}: {
    label: string;
    value: number;
    unit: string;
    onChange: (val: number) => void;
    icon: any;
    step?: number;
    min?: number;
    max?: number;
}) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5" />
            {label}
        </label>
        <div className="relative group">
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                step={step}
                min={min}
                max={max}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-3 pr-12 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
            <span className="absolute right-3 top-2 text-slate-400 text-sm font-medium">{unit}</span>
        </div>
    </div>
);

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, onUpdate, onReset }) => {

    const handleLimitChange = (key: keyof TrainingLimits, value: number) => {
        onUpdate({
            ...profile,
            limits: {
                ...profile.limits,
                [key]: value
            }
        });
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header / Meta */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 font-display">{profile.name}</h2>
                    <p className="text-slate-500">{profile.description}</p>
                </div>
                {onReset && (
                    <button
                        onClick={onReset}
                        className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-md hover:bg-red-50 border border-transparent hover:border-red-100"
                    >
                        Reset Defaults
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Wind Section */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="p-1.5 bg-sky-50 rounded-md text-sky-600">
                            <Wind className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800">Wind Limits</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <LimitInput
                            label="Max Wind"
                            value={profile.limits.maxWind}
                            unit="kts"
                            icon={Wind}
                            onChange={(v) => handleLimitChange('maxWind', v)}
                        />
                        <LimitInput
                            label="Max Gust"
                            value={profile.limits.maxGust}
                            unit="kts"
                            icon={AlertTriangle}
                            onChange={(v) => handleLimitChange('maxGust', v)}
                        />
                        <div className="col-span-2">
                            <LimitInput
                                label="Max Crosswind"
                                value={profile.limits.maxCrosswind}
                                unit="kts"
                                icon={Wind}
                                onChange={(v) => handleLimitChange('maxCrosswind', v)}
                            />
                        </div>
                    </div>
                </div>

                {/* Sky Condition Section */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="p-1.5 bg-indigo-50 rounded-md text-indigo-600">
                            <Cloud className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800">Ceiling & Visibility</h3>
                    </div>

                    <div className="space-y-4">
                        <LimitInput
                            label="Min Ceiling"
                            value={profile.limits.minCeiling}
                            unit="ft AGL"
                            step={100}
                            icon={Cloud}
                            onChange={(v) => handleLimitChange('minCeiling', v)}
                        />
                        <LimitInput
                            label="Min Visibility"
                            value={profile.limits.minVisibility}
                            unit="sm"
                            icon={Eye}
                            onChange={(v) => handleLimitChange('minVisibility', v)}
                        />
                        <LimitInput
                            label="Max Precip Chance"
                            value={profile.limits.maxPrecipProb}
                            unit="%"
                            max={100}
                            icon={CloudRain}
                            onChange={(v) => handleLimitChange('maxPrecipProb', v)}
                        />
                    </div>
                </div>
            </div>

            <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-100 flex gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p>
                    <strong>Safety Note:</strong> These personal minimums will determine the GO/NO-GO status on your dashboard.
                    Always verify official weather briefings before flight.
                </p>
            </div>

        </div>
    );
};
