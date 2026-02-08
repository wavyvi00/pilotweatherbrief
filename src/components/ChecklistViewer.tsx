```
import { useState, useEffect } from 'react';
import { ALL_CHECKLISTS } from '../data/checklists';
import type { ChecklistSection } from '../types/checklist';
import { useAircraft } from '../hooks/useAircraft';
import { CheckCircle, Pause, ChevronDown, ChevronRight, Volume2 } from 'lucide-react';
import clsx from 'clsx';

export const ChecklistViewer = () => {
    const { activeAircraft } = useAircraft();
    
    // Find relevant checklist for active aircraft
    const checklist = ALL_CHECKLISTS.find(c => c.aircraftType === activeAircraft.type) || ALL_CHECKLISTS[0];

    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        [checklist.sections[0].id]: true // Expand first by default
    });
    
    // TTS State
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);

    const toggleCheck = (id: string) => {
        setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleSection = (id: string) => {
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const speakSection = (section: ChecklistSection) => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setCurrentSpeakingId(null);
            return;
        }

        setIsSpeaking(true);
        setCurrentSpeakingId(section.id);

        const utterances: SpeechSynthesisUtterance[] = [];

        // Title
        const titleUtt = new SpeechSynthesisUtterance(section.title);
        utterances.push(titleUtt);

        // Items
        section.items.forEach(item => {
            const text = item.label.replace('-', '... check ...'); // Pause for dash
            const utt = new SpeechSynthesisUtterance(text);
            utterances.push(utt);
        });

        // Queue them
        let index = 0;
        const speakNext = () => {
            if (index < utterances.length) {
                const u = utterances[index];
                u.onend = () => {
                    index++;
                    speakNext();
                };
                window.speechSynthesis.speak(u);
            } else {
                setIsSpeaking(false);
                setCurrentSpeakingId(null);
            }
        };

        if (utterances.length > 0) {
            // Ensure section is expanded
            setExpandedSections(prev => ({ ...prev, [section.id]: true }));
            speakNext();
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    // Calculate progress
    const totalItems = checklist.sections.reduce((acc, s) => acc + s.items.length, 0);
    const completedItems = Object.values(checkedItems).filter(Boolean).length;
    const progress = Math.round((completedItems / totalItems) * 100);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[calc(100vh-200px)]">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        {checklist.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {activeAircraft.registration} ({activeAircraft.type})
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Progress</div>
                        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{progress}%</div>
                    </div>
                     <div className="w-10 h-10 rounded-full border-4 border-slate-200 dark:border-slate-700 flex items-center justify-center relative">
                        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="4"
                                strokeDasharray={`${progress}, 100`}
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {checklist.sections.map(section => (
                    <div key={section.id} className="bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        
                        {/* Section Header */}
                        <div 
                            className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                            onClick={() => toggleSection(section.id)}
                        >
                            <div className="flex items-center gap-3">
                                {expandedSections[section.id] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                                <h4 className="font-bold text-slate-700 dark:text-slate-200">{section.title}</h4>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    speakSection(section);
                                }}
                                className={clsx("p-2 rounded-full transition-all",
                                    currentSpeakingId === section.id && isSpeaking
                                        ? "bg-sky-100 text-sky-600 animate-pulse" 
                                        : "text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/30"
                                )}
                            >
                                {currentSpeakingId === section.id && isSpeaking ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Items */}
                        {expandedSections[section.id] && (
                            <div className="border-t border-slate-200 dark:border-slate-700">
                                {section.items.map(item => (
                                    <div 
                                        key={item.id}
                                        onClick={() => toggleCheck(item.id)}
                                        className={clsx("p-3 flex items-center gap-3 cursor-pointer border-b last:border-0 border-slate-100 dark:border-slate-700/50 transition-colors",
                                            checkedItems[item.id] ? "bg-emerald-50/50 dark:bg-emerald-900/10" : "hover:bg-white dark:hover:bg-slate-800"
                                        )}
                                    >
                                        <div className={clsx("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                            checkedItems[item.id] 
                                                ? "bg-emerald-500 border-emerald-500" 
                                                : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                                        )}>
                                            {checkedItems[item.id] && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <div className={clsx("flex-1 text-sm font-medium transition-all",
                                            checkedItems[item.id] ? "text-slate-400 line-through decoration-slate-300" : "text-slate-700 dark:text-slate-300"
                                        )}>
                                            {item.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

             {/* Footer Reset */}
             <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-center">
                <button 
                    onClick={() => setCheckedItems({})}
                    className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors"
                >
                    Reset Checklist
                </button>
             </div>
        </div>
    );
};
