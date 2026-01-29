import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AIRPORTS } from '../data/airports';
import { Icon, DivIcon } from 'leaflet';
import { useMapStatus, type StatusColor } from '../hooks/useMapStatus';
import { useProfiles } from '../hooks/useProfiles';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';

// Keep the default icon setup for generic usage if needed, but we will override with DivIcon
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Helper for status colors
const getColorClass = (status: StatusColor) => {
    switch (status) {
        case 'green': return 'bg-emerald-500 border-emerald-600';
        case 'yellow': return 'bg-amber-400 border-amber-500';
        case 'red': return 'bg-rose-500 border-rose-600';
        default: return 'bg-slate-300 border-slate-400';
    }
};

const createStatusIcon = (status: StatusColor, isSelected: boolean) => {
    const colorClass = getColorClass(status);
    const scale = isSelected ? 'scale-125 ring-4 ring-sky-500/30' : 'scale-100 hover:scale-110';

    return new DivIcon({
        className: 'custom-div-icon',
        html: `<div class="${colorClass} ${scale} w-4 h-4 rounded-full border-2 shadow-sm transition-transform duration-200 block"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
};

// Component to recenter map when station changes
const RecenterMap = ({ lat, lon }: { lat: number; lon: number }) => {
    const map = useMap();
    map.flyTo([lat, lon], 9, { animate: true });
    return null;
};

// Component to fit bounds for route
const RouteFitter = ({ from, to }: { from: { lat: number, lon: number }, to: { lat: number, lon: number } }) => {
    const map = useMap();
    map.fitBounds([
        [from.lat, from.lon],
        [to.lat, to.lon]
    ], { padding: [50, 50] });
    return null;
};

interface WeatherMapProps {
    currentStation: string;
    onSelect: (icao: string) => void;
    route?: {
        from: string;
        to: string | null;
    };
}

export const WeatherMap = ({ currentStation, onSelect, route }: WeatherMapProps) => {
    const { activeProfile } = useProfiles();

    const [selectedTime, setSelectedTime] = useState<Date | null>(null);
    const [isLive, setIsLive] = useState(true);

    const { statuses, loading } = useMapStatus(activeProfile, isLive ? null : selectedTime);
    const activeAirport = AIRPORTS.find(a => a.icao === currentStation) || AIRPORTS[0];

    // Route logic
    const fromAirport = route?.from ? AIRPORTS.find(a => a.icao === route.from) : null;
    const toAirport = route?.to ? AIRPORTS.find(a => a.icao === route.to) : null;
    const hasRoute = !!(fromAirport && toAirport);

    return (
        <div className="h-[400px] md:h-[600px] w-full rounded-xl overflow-hidden shadow-sm border border-slate-200 z-0 relative bg-slate-100">
            <MapContainer
                center={[activeAirport.lat, activeAirport.lon]}
                zoom={9}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {!hasRoute && <RecenterMap lat={activeAirport.lat} lon={activeAirport.lon} />}
                {hasRoute && <RouteFitter from={fromAirport!} to={toAirport!} />}

                {/* Draw Route Line */}
                {hasRoute && (
                    <Polyline
                        positions={[
                            [fromAirport!.lat, fromAirport!.lon],
                            [toAirport!.lat, toAirport!.lon]
                        ]}
                        pathOptions={{ color: '#0ea5e9', weight: 4, opacity: 0.6, dashArray: '10, 10' }}
                    />
                )}

                {AIRPORTS.map((airport) => {
                    const status = statuses[airport.icao] || 'gray';
                    const isSelected = airport.icao === currentStation;

                    // Highlight Start/End of route
                    const isStart = route?.from === airport.icao;
                    const isEnd = route?.to === airport.icao;

                    return (
                        <Marker
                            key={airport.icao}
                            position={[airport.lat, airport.lon]}
                            icon={createStatusIcon(status, isSelected || isStart || isEnd)}
                            eventHandlers={{
                                click: () => onSelect(airport.icao),
                            }}
                        >
                            <Popup>
                                <div className="p-1 min-w-[120px] text-center">
                                    <h3 className="font-bold text-slate-900 text-lg">{airport.icao}</h3>
                                    <p className="text-xs text-slate-500 mb-2">{airport.name}</p>

                                    <div className={`text-xs font-bold px-2 py-1 rounded inline-block uppercase
                                        ${status === 'green' ? 'bg-emerald-100 text-emerald-700' :
                                            status === 'red' ? 'bg-rose-100 text-rose-700' :
                                                status === 'yellow' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}
                                    `}>
                                        {status === 'green' ? 'GO' : status === 'red' ? 'NO-GO' : status === 'yellow' ? 'MARGINAL' : 'NO DATA'}
                                    </div>
                                    {(isStart) && <div className="mt-1 text-xs font-bold text-sky-600">DEPARTURE</div>}
                                    {(isEnd) && <div className="mt-1 text-xs font-bold text-indigo-600">DESTINATION</div>}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Time Controls Overlay */}
            <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur shadow-lg rounded-xl border border-slate-200 p-2 flex flex-col gap-2 min-w-[160px] max-w-[200px]">
                {/* Live Toggle */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-1 mb-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mode</span>
                    <button
                        onClick={() => {
                            setIsLive(!isLive);
                            if (!isLive) setSelectedTime(null);
                        }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${isLive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                        {isLive ? '● LIVE' : '○ FCST'}
                    </button>
                </div>

                {/* Date/Time Picker */}
                {!isLive && (
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] uppercase font-bold text-slate-300">Target Time</label>
                        <input
                            type="datetime-local"
                            className="text-xs border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-sky-500 w-full"
                            onChange={(e) => {
                                if (e.target.value) setSelectedTime(new Date(e.target.value));
                            }}
                        />
                    </div>
                )}

                {/* Current Map Time Display */}
                <div className="flex items-center gap-1.5 text-slate-700 pt-0.5">
                    <Clock className="w-3.5 h-3.5 text-sky-500" />
                    <span className="font-mono font-bold text-xs">
                        {isLive
                            ? format(new Date(), 'HH:mm') // System time in 24h
                            : selectedTime ? format(selectedTime, 'HH:mm') : '--:--'}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">{isLive ? 'LOCAL' : 'LOCAL'}</span>
                </div>
                {loading && <div className="text-[9px] text-sky-500 animate-pulse font-medium">Updating...</div>}
            </div>

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-md border border-slate-200 z-[1000] text-xs space-y-2">
                <div className="font-bold text-slate-700 mb-1">Status ({activeProfile.name})</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> GO</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-400"></div> MARGINAL</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500"></div> NO-GO</div>
            </div>
        </div>
    );
};
