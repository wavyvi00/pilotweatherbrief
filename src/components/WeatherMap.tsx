import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, CircleMarker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AIRPORTS } from '../data/airports';
import type { Route } from '../types/route';
import { getRouteIcaos } from '../types/route';
import { Icon, DivIcon } from 'leaflet';
import { useMapStatus, type StatusColor } from '../hooks/useMapStatus';
import { useProfiles } from '../hooks/useProfiles';
import { useAircraft } from '../hooks/useAircraft';
import { Clock, Radio, Circle } from 'lucide-react';
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

// --- OPTIMIZATION COMPONENTS ---

interface ViewportFilterProps {
    allAirports: typeof AIRPORTS;
    setVisible: (airports: typeof AIRPORTS) => void;
    maxMarkers: number;
}

const ViewportFilter = ({ allAirports, setVisible, maxMarkers }: ViewportFilterProps) => {
    const map = useMapEvents({
        moveend: () => {
            const bounds = map.getBounds();
            const zoom = map.getZoom();

            // Very rough optimization: If zoom is very low (country view), show minimal set 
            // Or primarily rely on maxMarkers slice.
            if (zoom < 6) {
                setVisible(allAirports.slice(0, 50)); // Just 50 arbitrary, or major hubs if we had them
                return;
            }

            // Filter
            const visible = allAirports.filter(a =>
                bounds.contains([a.lat, a.lon])
            );

            // Cap
            setVisible(visible.slice(0, maxMarkers));
        }
    });

    // Initial load trigger
    useEffect(() => {
        // Trigger once on mount usually? Or rely on map events.
        // Map events might not fire on mount.
        // We set initial state in parent to "some" or "all" then filter.
        // Actually, let's force a filter.
        const t = setTimeout(() => {
            map.fire('moveend');
        }, 500);
        return () => clearTimeout(t);
    }, [map]);

    return null;
};

// Component to recenter map when station changes
const RecenterMap = ({ lat, lon }: { lat: number; lon: number }) => {
    const map = useMap();

    useEffect(() => {
        map.flyTo([lat, lon], 9, { animate: true });
    }, [lat, lon, map]);

    return null;
};

// Component to fit bounds for route
const RouteFitter = ({ from, to }: { from: { lat: number, lon: number }, to: { lat: number, lon: number } }) => {
    const map = useMap();

    useEffect(() => {
        if (from && to) {
            map.fitBounds([
                [from.lat, from.lon],
                [to.lat, to.lon]
            ], { padding: [50, 50] });
        }
    }, [from, to, map]);

    return null;
};

interface WeatherMapProps {
    currentStation: string;
    onSelect: (icao: string) => void;
    route?: Route; // Use the full Route type
}

export const WeatherMap = ({ currentStation, onSelect, route }: WeatherMapProps) => {
    const { activeProfile } = useProfiles();
    const { activeAircraft } = useAircraft();

    // Optimisation: Only render visible airports
    const [visibleAirports, setVisibleAirports] = useState<typeof AIRPORTS>([]);

    const [selectedTime, setSelectedTime] = useState<Date | null>(null);
    const [isLive, setIsLive] = useState(true);

    const { statuses, loading } = useMapStatus(activeProfile, isLive ? null : selectedTime, activeAircraft);
    const activeAirport = AIRPORTS.find(a => a.icao === currentStation) || AIRPORTS[0];

    // Route logic
    const routeWaypoints = route ? getRouteIcaos(route).map(icao => AIRPORTS.find(a => a.icao === icao)).filter(Boolean) as typeof AIRPORTS : [];
    const hasRoute = routeWaypoints.length >= 2;

    return (
        <div className="h-[400px] md:h-[600px] w-full rounded-xl overflow-hidden shadow-sm border border-slate-200 z-0 relative bg-slate-100">
            <MapContainer
                center={[activeAirport.lat, activeAirport.lon]}
                zoom={9}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
                preferCanvas={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <ViewportFilter
                    allAirports={AIRPORTS}
                    setVisible={setVisibleAirports}
                    maxMarkers={150} // Hard cap for performance
                />

                {!hasRoute && <RecenterMap lat={activeAirport.lat} lon={activeAirport.lon} />}
                {hasRoute && <RouteFitter from={routeWaypoints[0]} to={routeWaypoints[routeWaypoints.length - 1]} />}

                {/* Draw Route Line */}
                {hasRoute && (
                    <Polyline
                        positions={routeWaypoints.map(wp => [wp.lat, wp.lon])}
                        pathOptions={{ color: '#0ea5e9', weight: 4, opacity: 0.6, dashArray: '10, 10' }}
                    />
                )}

                {/* Render Optimised Markers */}
                {visibleAirports.map((airport) => {
                    const status = statuses[airport.icao] || 'gray';
                    const isSelected = airport.icao === currentStation;
                    const isStart = route?.from === airport.icao;
                    const isEnd = route?.to === airport.icao;
                    const isImportant = isSelected || isStart || isEnd;

                    // Color Mapping
                    let fillColor = '#cbd5e1'; // slate-300
                    let borderColor = '#94a3b8'; // slate-400
                    if (status === 'green') { fillColor = '#10b981'; borderColor = '#059669'; }
                    if (status === 'yellow') { fillColor = '#fbbf24'; borderColor = '#d97706'; }
                    if (status === 'red') { fillColor = '#f43f5e'; borderColor = '#e11d48'; }

                    // High Priority: Render as detailed DOM Marker
                    if (isImportant) {
                        return (
                            <Marker
                                key={airport.icao}
                                position={[airport.lat, airport.lon]}
                                icon={createStatusIcon(status, true)}
                                eventHandlers={{ click: () => onSelect(airport.icao) }}
                                zIndexOffset={1000}
                            >
                                <Popup>
                                    <div className="p-1 min-w-[120px] text-center">
                                        <h3 className="font-bold text-slate-900 text-lg">{airport.icao}</h3>
                                        <p className="text-xs text-slate-500 mb-2">{airport.name}</p>
                                        <div className={`text-xs font-bold px-2 py-1 rounded inline-block uppercase ${status === 'green' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {status.toUpperCase()}
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    }

                    // Low Priority: Render as Canvas CircleMarker
                    return (
                        <CircleMarker
                            key={airport.icao}
                            center={[airport.lat, airport.lon]}
                            radius={5}
                            pathOptions={{
                                fillColor: fillColor,
                                color: borderColor,
                                weight: 1,
                                fillOpacity: 0.8
                            }}
                            eventHandlers={{ click: () => onSelect(airport.icao) }}
                        >
                            <Popup>
                                <div className="p-1 min-w-[100px] text-center">
                                    <h3 className="font-bold text-slate-900">{airport.icao}</h3>
                                    <div className="text-[10px] text-slate-500">{airport.name}</div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}

                {/* Always render Route Endpoints even if culled (Safety) */}
                {/* (Optional: logic to ensure start/end are always in visibleAirports or rendered separately. For simplicity, we rely on them likely being in view if routing, or RecenterMap handles it.) */}

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
                        {isLive ? (
                            <div className="flex items-center gap-1.5"><Radio className="w-3 h-3 animate-pulse" /> LIVE</div>
                        ) : (
                            <div className="flex items-center gap-1.5"><Circle className="w-3 h-3" /> FCST</div>
                        )}
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
