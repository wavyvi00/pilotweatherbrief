
import { useState } from 'react';
import { X, Plus, Trash2, Save, Pencil } from 'lucide-react';
import type { Aircraft } from '../types/aircraft';

interface AircraftManagerProps {
    isOpen: boolean;
    onClose: () => void;
    fleet: Aircraft[];
    onAdd: (a: Omit<Aircraft, 'id'>) => void;
    onUpdate: (id: string, updates: Partial<Aircraft>) => void;
    onDelete: (id: string) => void;
}

export const AircraftManager = ({ isOpen, onClose, fleet, onAdd, onUpdate, onDelete }: AircraftManagerProps) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newShip, setNewShip] = useState({
        registration: '',
        type: '',
        name: '',
        cruiseSpeed: 110,
        fuelBurn: 9,
        requiredEndorsements: [] as string[]
    });
    const [editShip, setEditShip] = useState({
        registration: '',
        type: '',
        cruiseSpeed: 110,
        fuelBurn: 9,
        requiredEndorsements: [] as string[]
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
            },
            requiredEndorsements: newShip.requiredEndorsements
        });
        setIsAdding(false);
        setNewShip({ registration: '', type: '', name: '', cruiseSpeed: 110, fuelBurn: 9, requiredEndorsements: [] });
    };

    const startEdit = (ship: Aircraft) => {
        setEditingId(ship.id);
        setEditShip({
            registration: ship.registration,
            type: ship.type,
            cruiseSpeed: ship.performance.cruiseSpeed,
            fuelBurn: ship.performance.fuelBurn,
            requiredEndorsements: ship.requiredEndorsements || []
        });
        setIsAdding(false); // Close add form if open
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId) return;
        onUpdate(editingId, {
            registration: editShip.registration.toUpperCase(),
            type: editShip.type,
            performance: {
                cruiseSpeed: Number(editShip.cruiseSpeed),
                fuelBurn: Number(editShip.fuelBurn),
                usableFuel: 40,
                range: 0
            },
            requiredEndorsements: editShip.requiredEndorsements
        });
        setEditingId(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    return (
        <div className="fixed inset-0 z-[2000] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">

                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                    <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">Manage Fleet</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto flex-1">

                    {/* List */}
                    <div className="space-y-3 mb-6">
                        {fleet.map(ship => (
                            editingId === ship.id ? (
                                /* Edit Form Inline */
                                <form key={ship.id} onSubmit={handleEditSubmit} className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-700 animate-in fade-in">
                                    <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                                        <Pencil className="w-4 h-4" /> Edit Aircraft
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Registration</label>
                                            <input
                                                required
                                                className="w-full text-sm font-bold p-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white uppercase placeholder:text-slate-300"
                                                value={editShip.registration}
                                                onChange={e => setEditShip({ ...editShip, registration: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Type</label>
                                                <input
                                                    required
                                                    className="w-full text-sm font-bold p-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white placeholder:text-slate-300"
                                                    value={editShip.type}
                                                    onChange={e => setEditShip({ ...editShip, type: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">KTAS</label>
                                                <input
                                                    required
                                                    type="number"
                                                    className="w-full text-sm font-bold p-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                                    value={editShip.cruiseSpeed}
                                                    onChange={e => setEditShip({ ...editShip, cruiseSpeed: Number(e.target.value) })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">GPH</label>
                                                <input
                                                    required
                                                    type="number"
                                                    step="0.1"
                                                    className="w-full text-sm font-bold p-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                                    value={editShip.fuelBurn}
                                                    onChange={e => setEditShip({ ...editShip, fuelBurn: Number(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 pt-1">
                                            {['complex', 'high-performance', 'tailwheel', 'high-altitude'].map(endo => (
                                                <label key={endo} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-amber-500 focus:ring-amber-500"
                                                        checked={editShip.requiredEndorsements?.includes(endo)}
                                                        onChange={e => {
                                                            const current = editShip.requiredEndorsements || [];
                                                            const next = e.target.checked
                                                                ? [...current, endo]
                                                                : current.filter(x => x !== endo);
                                                            setEditShip({ ...editShip, requiredEndorsements: next });
                                                        }}
                                                    />
                                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 capitalize">
                                                        {endo.replace('-', ' ')}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2">
                                                <Save className="w-4 h-4" /> Update
                                            </button>
                                            <button type="button" onClick={cancelEdit} className="px-4 py-2 text-slate-500 dark:text-slate-400 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                /* Normal Display */
                                <div key={ship.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:border-sky-300 dark:hover:border-sky-600 transition-colors group">
                                    <div
                                        className="flex-1 cursor-pointer"
                                        onClick={() => startEdit(ship)}
                                    >
                                        <div className="flex items-baseline gap-2">
                                            <h3 className="font-bold text-slate-900 dark:text-slate-100">{ship.registration}</h3>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{ship.type}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ship.performance.cruiseSpeed} kts • {ship.performance.fuelBurn} gph</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => startEdit(ship)}
                                            className="p-2 text-slate-300 dark:text-slate-500 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Edit aircraft"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm(`Delete ${ship.registration}?`)) onDelete(ship.id);
                                            }}
                                            className="p-2 text-slate-300 dark:text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                                            title="Delete aircraft"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>

                    {/* Add Form */}
                    {isAdding ? (
                        <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-2">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">Add New Aircraft</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Registration</label>
                                    <input
                                        required
                                        className="w-full text-sm font-bold p-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white uppercase placeholder:text-slate-300"
                                        placeholder="N123AB"
                                        value={newShip.registration}
                                        onChange={e => setNewShip({ ...newShip, registration: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Type</label>
                                        <input
                                            required
                                            className="w-full text-sm font-bold p-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white placeholder:text-slate-300"
                                            placeholder="C172"
                                            value={newShip.type}
                                            onChange={e => setNewShip({ ...newShip, type: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">KTAS</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full text-sm font-bold p-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                            value={newShip.cruiseSpeed}
                                            onChange={e => setNewShip({ ...newShip, cruiseSpeed: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">GPH</label>
                                        <input
                                            required
                                            type="number"
                                            step="0.1"
                                            className="w-full text-sm font-bold p-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                            value={newShip.fuelBurn}
                                            onChange={e => setNewShip({ ...newShip, fuelBurn: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pt-1">
                                    {['complex', 'high-performance', 'tailwheel', 'high-altitude'].map(endo => (
                                        <label key={endo} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-sky-500 focus:ring-sky-500"
                                                checked={newShip.requiredEndorsements?.includes(endo)}
                                                onChange={e => {
                                                    const current = newShip.requiredEndorsements || [];
                                                    const next = e.target.checked
                                                        ? [...current, endo]
                                                        : current.filter(x => x !== endo);
                                                    setNewShip({ ...newShip, requiredEndorsements: next });
                                                }}
                                            />
                                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 capitalize">
                                                {endo.replace('-', ' ')}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button type="submit" className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2">
                                        <Save className="w-4 h-4" /> Save
                                    </button>
                                    <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-500 dark:text-slate-400 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <button
                            onClick={() => { setIsAdding(true); setEditingId(null); }}
                            className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-400 font-bold hover:border-sky-400 hover:text-sky-500 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" /> Add Aircraft
                        </button>
                    )}

                </div>
            </div>
        </div>
    );
};
