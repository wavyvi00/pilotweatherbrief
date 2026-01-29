
import { Plane } from 'lucide-react';
import type { Aircraft } from '../types/aircraft';

interface AircraftSelectorProps {
    fleet: Aircraft[];
    activeId: string;
    onSelect: (id: string) => void;
    onManage?: () => void;
}

export const AircraftSelector = ({ fleet, activeId, onSelect, onManage }: AircraftSelectorProps) => {
    return (
        <div className="relative group">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg pl-3 pr-2 py-2.5 shadow-sm hover:border-sky-500 transition-all cursor-pointer">
                <Plane className="w-4 h-4 text-sky-500 mr-2" />
                <select
                    value={activeId}
                    onChange={(e) => {
                        if (e.target.value === 'manage') {
                            onManage?.();
                        } else {
                            onSelect(e.target.value);
                        }
                    }}
                    className="appearance-none bg-transparent outline-none text-sm font-bold text-slate-700 min-w-[140px] cursor-pointer"
                >
                    <optgroup label="My Fleet">
                        {fleet.map(a => (
                            <option key={a.id} value={a.id}>
                                {a.registration} - {a.type}
                            </option>
                        ))}
                    </optgroup>
                    <optgroup label="Actions">
                        <option value="manage">⚙ Manage Fleet...</option>
                    </optgroup>
                </select>
                <div className="pointer-events-none text-slate-400 pl-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </div>
            </div>
        </div>
    );
};
