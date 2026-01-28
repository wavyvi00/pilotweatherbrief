import { useState, useRef, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { AIRPORTS, type Airport } from '../data/airports';


interface AirportSearchProps {
    onSelect: (icao: string) => void;
    currentStation: string;
}

export const AirportSearch = ({ onSelect, currentStation }: AirportSearchProps) => {
    const [inputValue, setInputValue] = useState(currentStation);
    const [isOpen, setIsOpen] = useState(false);
    const [matches, setMatches] = useState<Airport[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync input if currentStation changes externally
    useEffect(() => {
        setInputValue(currentStation);
    }, [currentStation]);

    // Handle clicks outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toUpperCase();
        setInputValue(val);

        if (val.length > 0) {
            // Filter airports
            const filtered = AIRPORTS.filter(a =>
                a.icao.includes(val) ||
                a.city.toUpperCase().includes(val) ||
                a.name.toUpperCase().includes(val)
            ).slice(0, 6); // limit to 6 matches

            setMatches(filtered);
            setIsOpen(true);
        } else {
            setMatches([]);
            setIsOpen(false);
        }
    };

    const handleSelect = (icao: string) => {
        setInputValue(icao);
        onSelect(icao);
        setIsOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.length >= 3) {
            onSelect(inputValue.toUpperCase());
            setIsOpen(false);
        }
    };

    return (
        <div ref={wrapperRef} className="relative group z-50">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInput}
                    onFocus={() => inputValue.length > 0 && setIsOpen(true)}
                    className="bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 w-full md:w-40 md:focus:w-64 transition-all outline-none uppercase font-bold text-sm text-slate-800 shadow-sm focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 placeholder:text-slate-400"
                    placeholder="Search Airport..."
                />
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
            </form>

            {/* Dropdown Results */}
            {isOpen && matches.length > 0 && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in">
                    <div className="py-2">
                        {matches.map((airport) => (
                            <button
                                key={airport.icao}
                                onClick={() => handleSelect(airport.icao)}
                                className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-start gap-3 transition-colors group/item"
                            >
                                <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover/item:text-sky-600 group-hover/item:bg-sky-50 transition-colors">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-800">{airport.icao}</span>
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{airport.state}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate max-w-[180px]">{airport.name}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* "No matches" helper can go here if needed, but usually kept clean */}
        </div>
    );
};
