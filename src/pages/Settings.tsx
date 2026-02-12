import { GlassCard } from '../components/ui/GlassCard';
import { useProfiles } from '../hooks/useProfiles';
import { useAircraft } from '../hooks/useAircraft';
import { useSettings } from '../hooks/useSettings';
import { useRevenueCat } from '../contexts/RevenueCatContext';
import { ProfileEditor } from '../components/ProfileEditor';
import { Settings as SettingsIcon, Home, Plane, User, ChevronDown, CreditCard, Zap, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SubscriptionSection = () => {
    const { isPro, presentCustomerCenter, currentCustomerInfo } = useRevenueCat();
    const navigate = useNavigate();

    return (
        <GlassCard className="p-4 sm:p-6 md:p-8 mb-6 md:mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="w-32 h-32 text-sky-500" />
            </div>
            
            <div className="relative z-10">
                <div className="mb-6 border-b border-slate-100 dark:border-slate-700 pb-6">
                    <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-3">
                        Subscription
                        {isPro && <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full border border-emerald-500/20">ACTIVE</span>}
                    </h1>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl">
                        Manage your Flight Solo subscription and billing.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                            {isPro ? 'Flight Solo Pro' : 'Free Plan'}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {isPro 
                                ? `Renews: ${currentCustomerInfo?.latestExpirationDate ? new Date(currentCustomerInfo.latestExpirationDate).toLocaleDateString() : 'Unknown'}`
                                : 'Upgrade to unlock advanced features.'}
                        </p>
                    </div>

                    <div className="flex gap-3">
                         {isPro ? (
                            <button 
                                onClick={() => presentCustomerCenter()}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <CreditCard className="w-4 h-4" />
                                Manage Subscription
                            </button>
                         ) : (
                            <button 
                                onClick={() => navigate('/subscription')}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-indigo-500 transition-all"
                            >
                                <Zap className="w-4 h-4" />
                                Upgrade to Pro
                            </button>
                         )}
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};

export const SettingsPage = () => {
    const { activeProfile, updateProfile, resetProfiles, profiles } = useProfiles();
    const { fleet } = useAircraft();
    const { settings, updateSetting } = useSettings();

    return (
        <div className="container mx-auto px-4 md:px-8 py-8 animate-fade-in max-w-[1000px]">
            {/* Page Header */}
            <div className="mb-8 flex items-center gap-3 text-slate-400">
                <SettingsIcon className="w-5 h-5" />
                <span className="font-medium text-sm uppercase tracking-wider">Configuration</span>
            </div>

            {/* Subscription Section */}
            <SubscriptionSection />

            {/* Defaults Section */}
            <GlassCard className="p-4 sm:p-6 md:p-8 mb-6 md:mb-8">
                <div className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-slate-100 dark:border-slate-700">
                    <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-slate-100 mb-2">Defaults</h1>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl">
                        Set your default home base and preferred aircraft. These will be pre-selected when you open the dashboard.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Home Airport */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            <Home className="w-4 h-4 text-sky-500" />
                            Home Airport
                        </label>
                        <input
                            type="text"
                            value={settings.defaultAirport}
                            onChange={(e) => updateSetting('defaultAirport', e.target.value.toUpperCase())}
                            placeholder="ICAO (e.g. KMCI)"
                            maxLength={4}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm uppercase placeholder:normal-case placeholder:font-normal focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all"
                        />
                        <p className="text-xs text-slate-400 mt-1">Loaded on startup</p>
                    </div>

                    {/* Default Aircraft */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            <Plane className="w-4 h-4 text-sky-500" />
                            Default Aircraft
                        </label>
                        <div className="relative">
                            <select
                                value={settings.defaultAircraftId || ''}
                                onChange={(e) => updateSetting('defaultAircraftId', e.target.value || null)}
                                className="w-full appearance-none px-4 py-2.5 pr-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none cursor-pointer transition-all"
                            >
                                <option value="">First Available</option>
                                {fleet.map(a => (
                                    <option key={a.id} value={a.id}>{a.registration} - {a.type}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Pre-selected aircraft</p>
                    </div>

                    {/* Default Profile */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            <User className="w-4 h-4 text-sky-500" />
                            Default Profile
                        </label>
                        <div className="relative">
                            <select
                                value={settings.defaultProfileId || ''}
                                onChange={(e) => updateSetting('defaultProfileId', e.target.value || null)}
                                className="w-full appearance-none px-4 py-2.5 pr-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none cursor-pointer transition-all"
                            >
                                <option value="">First Available</option>
                                {profiles.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Training profile</p>
                    </div>
                </div>
            </GlassCard>

            {/* Personal Minimums Section */}
            <GlassCard className="p-8">
                <div className="mb-8 pb-8 border-b border-slate-100 dark:border-slate-700">
                    <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-slate-100 mb-2">Personal Minimums</h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
                        Define your safety boundaries. These limits are used to calculate the Suitability Score on your dashboard.
                        Changes are saved automatically to your browser.
                    </p>
                </div>

                <ProfileEditor
                    profile={activeProfile}
                    onUpdate={updateProfile}
                    onReset={() => {
                        if (confirm('Are you sure you want to reset all profiles to default?')) {
                            resetProfiles();
                        }
                    }}
                />
            </GlassCard>
        </div>
    );
};
