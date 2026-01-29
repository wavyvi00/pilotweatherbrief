
import { useState } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import type { Aircraft } from '../types/aircraft';

interface AircraftManagerProps {
    isOpen: boolean;
    onClose: () => void;
    fleet: Aircraft[];
    onAdd: (a: Omit<Aircraft, 'id'>) => void;
    onDelete: (id: string) => void;
}

export const AircraftManager = ({ isOpen, onClose, fleet, onAdd, onDelete }: AircraftManagerProps) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newShip, setNewShip] = useState({
        registration: '',
        type: '',
        name: '',
        cruiseSpeed: 110,
        fuelBurn: 9
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            registration: newShip.registration.toUpperCase(),
            type: newShip.type,
            name: newShip.name,
            performance: {
                cruiseSpeed: Number(newShip.cruiseSpeed),
                fuelBurn: Number(newShip.fuelBurn),
                usableFuel: 40, // default
                range: 0 // calc
            }
        });
        setIsAdding(false);
        setNewShip({ registration: '', type: '', name: '', cruiseSpeed: 110, fuelBurn: 9 });
    };

    return (
        <div className="fixed inset-0 z-[2000] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">

                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h2 className="font-bold text-lg text-slate-800">Manage Fleet</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto flex-1">

                    {/* List */}
                    <div className="space-y-3 mb-6">
                        {fleet.map(ship => (
                            <div key={ship.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="font-bold text-slate-900">{ship.registration}</h3>
                                        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded">{ship.type}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">{ship.performance.cruiseSpeed} kts • {ship.performance.fuelBurn} gph</p>
                                </div>
                                <button
                                    onClick={() => {
                                        if (confirm(`Delete ${ship.registration}?`)) onDelete(ship.id);
                                    }}
                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add Form */}
                    {isAdding ? (
                        <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-bottom-2">
                            <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Add New Aircraft</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1">Registration</label>
                                    <input
                                        required
                                        className="w-full text-sm font-bold p-2 rounded-lg border border-slate-300 uppercase placeholder:text-slate-300"
                                        placeholder="N123AB"
                                        value={newShip.registration}
                                        onChange={e => setNewShip({ ...newShip, registration: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 block mb-1">Type Code</label>
                                        <input
                                            required
                                            className="w-full text-sm font-bold p-2 rounded-lg border border-slate-300 placeholder:text-slate-300"
                                            placeholder="C172"
                                            value={newShip.type}
                                            onChange={e => setNewShip({ ...newShip, type: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 block mb-1">Cruise (KTAS)</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full text-sm font-bold p-2 rounded-lg border border-slate-300"
                                            value={newShip.cruiseSpeed}
                                            onChange={e => setNewShip({ ...newShip, cruiseSpeed: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button type="submit" className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2">
                                        <Save className="w-4 h-4" /> Save
                                    </button>
                                    <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-500 font-bold text-sm hover:bg-slate-200 rounded-lg">Cancel</button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 font-bold hover:border-sky-400 hover:text-sky-500 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" /> Add Aircraft
                        </button>
                    )}

                </div>
            </div>
        </div>
    );
};
