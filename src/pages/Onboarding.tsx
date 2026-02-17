import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfiles } from '../hooks/useProfiles';
import { useAircraft } from '../hooks/useAircraft';
import { useSettings } from '../hooks/useSettings';
import {
    Plane,
    CheckCircle2,
    ShieldCheck,
    Search
} from 'lucide-react';
import { AIRPORTS } from '../data/airports';
import clsx from 'clsx';

// Helper for IDs
const createId = () => Math.random().toString(36).substring(2, 9);

type Step = 'welcome' | 'profile' | 'aircraft' | 'base' | 'analyzing' | 'paywall';

export const Onboarding = () => {
    const navigate = useNavigate();
    const { addProfile, setActiveProfileId } = useProfiles();
    const { addAircraft } = useAircraft();
    const { updateSetting } = useSettings();

    const [currentStep, setCurrentStep] = useState<Step>('welcome');

    // Form State
    const [pilotLevel, setPilotLevel] = useState('Private Pilot');
    const [aircraftType, setAircraftType] = useState('C172');
    const [baseAirport, setBaseAirport] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Handlers
    const handleNext = () => {
        if (currentStep === 'welcome') setCurrentStep('profile');
        else if (currentStep === 'profile') setCurrentStep('aircraft');
        else if (currentStep === 'aircraft') setCurrentStep('base');
        else if (currentStep === 'base') {
            setCurrentStep('analyzing');
            // Fake analysis delay
            setTimeout(() => {
                completeSetup();
                setCurrentStep('paywall');
            }, 3000);
        }
    };

    const completeSetup = async () => {
        // 1. Create Aircraft
        const template = getAircraftTemplate(aircraftType);

        await addAircraft({
            registration: 'N' + Math.floor(100 + Math.random() * 900) + 'OD', // Fake tail number
            type: aircraftType,
            name: aircraftType, // Added required name field
            performance: template.performance,
            stations: template.stations,
            cgEnvelope: template.cgEnvelope,
            requiredEndorsements: []
        });

        // 2. Create Profile
        const newProfileId = createId();
        addProfile({
            id: newProfileId,
            name: `${pilotLevel} Profile`,
            description: `Auto-generated profile for ${pilotLevel}`, // Added required description
            limits: getProfileDefaults(pilotLevel), // Changed minimums to limits
            endorsements: [], // Added required endorsements
            aircraft: {
                cruiseSpeed: template.performance.cruiseSpeed,
                fuelBurn: template.performance.fuelBurn,
                range: template.performance.range
            },
            totalHours: 0
        });
        setActiveProfileId(newProfileId);

        // 3. Set Base Airport
        if (baseAirport) {
            updateSetting('defaultAirport', baseAirport);
        }

        // 4. Mark onboarding as done (local storage or settings)
        localStorage.setItem('hasCompletedOnboarding', 'true');
    };

    const handleSkipPaywall = () => {
        navigate('/dashboard');
    };

    const filteredAirports = searchQuery.length > 2
        ? AIRPORTS.filter(a => a.icao.includes(searchQuery.toUpperCase()) || a.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
        : [];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4">

            {/* Progress Bar (Hidden on Paywall) */}
            {currentStep !== 'paywall' && (
                <div className="w-full max-w-md mb-8">
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-sky-500 transition-all duration-500 ease-out"
                            style={{ width: getProgress(currentStep) }}
                        />
                    </div>
                </div>
            )}

            <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[500px] flex flex-col relative">

                {/* Step Content */}
                <div className="flex-1 p-8 flex flex-col">

                    {currentStep === 'welcome' && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-20 h-20 bg-sky-100 dark:bg-sky-900/50 rounded-full flex items-center justify-center mb-6">
                                <Plane className="w-10 h-10 text-sky-500" />
                            </div>
                            <h1 className="text-3xl font-display font-bold mb-4">Welcome to FlightSolo</h1>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto">
                                Let's configure the app for your personal minimums and aircraft performance.
                            </p>
                            <button onClick={handleNext} className="btn-primary w-full py-4 text-lg">
                                Get Started
                            </button>
                        </div>
                    )}

                    {currentStep === 'profile' && (
                        <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-2xl font-bold mb-2">What's your certification?</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">We'll suggest safety minimums based on your level.</p>

                            <div className="space-y-3">
                                {['Student Pilot', 'Private Pilot', 'Instrument Rated', 'Commercial / ATP'].map(level => (
                                    <button
                                        key={level}
                                        onClick={() => setPilotLevel(level)}
                                        className={clsx(
                                            "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group",
                                            pilotLevel === level
                                                ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300"
                                                : "border-slate-100 dark:border-slate-700 hover:border-sky-200 dark:hover:border-slate-600"
                                        )}
                                    >
                                        <span className="font-medium">{level}</span>
                                        {pilotLevel === level && <CheckCircle2 className="w-5 h-5 text-sky-500" />}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-auto pt-8">
                                <button onClick={handleNext} className="btn-primary w-full">Next: Aircraft</button>
                            </div>
                        </div>
                    )}

                    {currentStep === 'aircraft' && (
                        <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-2xl font-bold mb-2">What do you fly?</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">Select a template to preload weight & balance data.</p>

                            <div className="grid grid-cols-2 gap-3">
                                {['C172', 'C182', 'PA28', 'SR20', 'SR22', 'DA40'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setAircraftType(type)}
                                        className={clsx(
                                            "p-4 rounded-xl border-2 text-center transition-all h-24 flex flex-col items-center justify-center gap-2",
                                            aircraftType === type
                                                ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300"
                                                : "border-slate-100 dark:border-slate-700 hover:border-sky-200 dark:hover:border-slate-600"
                                        )}
                                    >
                                        <Plane className="w-6 h-6 opacity-50" />
                                        <span className="font-bold">{type}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-auto pt-8">
                                <button onClick={handleNext} className="btn-primary w-full">Next: Home Base</button>
                            </div>
                        </div>
                    )}

                    {currentStep === 'base' && (
                        <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-2xl font-bold mb-2">Where are you based?</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">Enter your home airport ICAO code (e.g., KMCI).</p>

                            <div className="relative mb-4">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search airport (e.g. KLAX)"
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-transparent focus:border-sky-500 focus:outline-none text-lg uppercase"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                {filteredAirports.map(airport => (
                                    <button
                                        key={airport.icao}
                                        onClick={() => {
                                            setBaseAirport(airport.icao);
                                            setSearchQuery(airport.icao + ' - ' + airport.name);
                                        }}
                                        className={clsx(
                                            "w-full text-left p-3 rounded-lg flex items-center justify-between",
                                            baseAirport === airport.icao
                                                ? "bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300"
                                                : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                        )}
                                    >
                                        <div>
                                            <span className="font-bold mr-2">{airport.icao}</span>
                                            <span className="text-sm opacity-70 truncate">{airport.name}</span>
                                        </div>
                                        {baseAirport === airport.icao && <CheckCircle2 className="w-4 h-4 text-sky-500" />}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-auto pt-8">
                                <button
                                    onClick={handleNext}
                                    disabled={!baseAirport}
                                    className="btn-primary w-full disabled:opacity-50"
                                >
                                    Analyze & Configure
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 'analyzing' && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
                            <div className="relative w-24 h-24 mb-8">
                                <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-700 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-sky-500 rounded-full border-t-transparent animate-spin"></div>
                                <Plane className="absolute inset-0 m-auto w-8 h-8 text-sky-500 animate-pulse" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Personalizing FlightSolo...</h2>
                            <div className="space-y-2 text-slate-500 dark:text-slate-400">
                                <p className="animate-fade-in delay-100">Generating {aircraftType} performance profiles...</p>
                                <p className="animate-fade-in delay-[1000ms]">Setting {pilotLevel} safety margins...</p>
                                <p className="animate-fade-in delay-[2000ms]">Fetching live METARs for {baseAirport}...</p>
                            </div>
                        </div>
                    )}

                    {/* SOFT PAYWALL STEP */}
                    {currentStep === 'paywall' && (
                        <div className="flex-1 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-sky-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-sky-500/20">
                                <ShieldCheck className="w-8 h-8 text-white" />
                            </div>

                            <h2 className="text-3xl font-display font-bold mb-2">You're All Set!</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
                                Your profile is ready. Start your free trial to unlock full access to advanced weather, route planning, and checklist features.
                            </p>

                            <div className="w-full space-y-3 mb-8 text-left max-w-sm mx-auto">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-sky-50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-800/50">
                                    <CheckCircle2 className="w-5 h-5 text-sky-500 flex-shrink-0" />
                                    <span className="text-sm font-medium">Advanced Route Weather Briefings</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-sky-50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-800/50">
                                    <CheckCircle2 className="w-5 h-5 text-sky-500 flex-shrink-0" />
                                    <span className="text-sm font-medium">Unlimited Aircraft Profiles</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-sky-50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-800/50">
                                    <CheckCircle2 className="w-5 h-5 text-sky-500 flex-shrink-0" />
                                    <span className="text-sm font-medium">Airport Database & Charts</span>
                                </div>
                            </div>

                            <div className="mt-auto w-full space-y-3">
                                <button
                                    onClick={() => navigate('/subscription')}
                                    className="w-full py-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all"
                                >
                                    Start 7-Day Free Trial
                                </button>
                                <button
                                    onClick={handleSkipPaywall}
                                    className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-sm font-medium"
                                >
                                    Skip for now (Limited Access)
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Disclaimer */}
            <p className="mt-6 text-xs text-slate-400 text-center max-w-md">
                By continuing, you acknowledge that FlightSolo is for situational awareness only and not a replacement for an official briefing.
            </p>

            <style>{`
                .btn-primary {
                    @apply bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-500/25 py-3.5;
                }
            `}</style>
        </div>
    );
};

// --- Helpers ---

function getProgress(step: Step): string {
    switch (step) {
        case 'welcome': return '10%';
        case 'profile': return '30%';
        case 'aircraft': return '50%';
        case 'base': return '70%';
        case 'analyzing': return '90%';
        case 'paywall': return '100%';
        default: return '0%';
    }
}

function getAircraftTemplate(type: string): any {
    // Simplified templates
    return {
        performance: {
            cruiseSpeed: type === 'SR22' ? 170 : type === 'C182' ? 145 : type === 'C172' ? 115 : 100,
            fuelBurn: type === 'SR22' ? 18 : type === 'C172' ? 8 : 10,
            usableFuel: type === 'SR22' ? 56 : 40,
            range: type === 'SR22' ? 800 : 500,
            emptyWeight: 1600,
            emptyArm: 40,
            maxGrossWeight: 2550
        },
        stations: [],
        cgEnvelope: []
    };
}

function getProfileDefaults(level: string): any {
    // Default base structure
    const base = {
        maxWind: 20,
        maxGust: 10,
        maxCrosswind: 10,
        minCeiling: 2000,
        minVisibility: 3,
        allowIfr: false,
        maxPrecipProb: 30,
        minTempSpread: 3,
        maxDensityAltitude: 5000,
        minRunwayLength: 2000,
        minFreezingLevel: 5000,
        allowNight: false,
        minFuelReserve: 45
    };

    if (level === 'Student Pilot') {
        return {
            ...base,
            maxWind: 15,
            maxGust: 5,
            maxCrosswind: 8,
            minCeiling: 3000,
            minVisibility: 5,
            allowNight: false
        };
    }
    if (level === 'Private Pilot') {
        return {
            ...base,
            maxWind: 25,
            maxGust: 15,
            maxCrosswind: 12,
            minCeiling: 1500,
            minVisibility: 3,
            allowNight: true
        };
    }
    // Commercial/ATP/Instrument
    return {
        ...base,
        maxWind: 35,
        maxGust: 25,
        maxCrosswind: 20,
        minCeiling: 500,
        minVisibility: 1,
        allowIfr: true,
        maxPrecipProb: 80,
        minTempSpread: 0,
        maxDensityAltitude: 10000,
        minRunwayLength: 1500,
        minFreezingLevel: 0,
        allowNight: true
    };
}
