import { GlassCard } from '../components/ui/GlassCard';
import { useProfiles } from '../hooks/useProfiles';
import { ProfileEditor } from '../components/ProfileEditor';
import { Settings as SettingsIcon } from 'lucide-react';

export const SettingsPage = () => {
    const { activeProfile, updateProfile, resetProfiles } = useProfiles();

    return (
        <div className="container mx-auto px-4 md:px-8 py-8 animate-fade-in max-w-[1000px]">
            {/* Page Header */}
            <div className="mb-8 flex items-center gap-3 text-slate-400">
                <SettingsIcon className="w-5 h-5" />
                <span className="font-medium text-sm uppercase tracking-wider">Configuration</span>
            </div>

            <GlassCard className="p-8">
                {/* 
                    GlassCard uses white background by default now due to recent changes, 
                    but we might want to check if it has profile-editor specific styles.
                    The ProfileEditor itself has cards, so maybe we don't need a wrapper card?
                    Let's try rendering ProfileEditor directly inside the layout shell for a cleaner look,
                    or keep the GlassPaper as a base canvas.
                 */}
                <div className="mb-8 pb-8 border-b border-slate-100">
                    <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Personal Minimums</h1>
                    <p className="text-slate-500 max-w-2xl">
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
