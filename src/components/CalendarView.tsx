import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { WeatherWindow } from '../types/weather';
import type { TrainingProfile } from '../types/profile';
import type { Aircraft } from '../types/aircraft';
import { groupWeatherWindows, type SmartCalendarEvent } from '../logic/grouping';
import { CalendarToolbar } from './CalendarToolbar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarViewProps {
    windows: WeatherWindow[];
    profile: TrainingProfile;
    aircraft?: Aircraft;
    onSelectDay: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ windows, profile, aircraft, onSelectDay }) => {

    // Transform WeatherWindows into Smart Calendar Events (Grouped)
    const events = useMemo(() => {
        return groupWeatherWindows(windows, profile, aircraft);
    }, [windows, profile, aircraft]);

    const [view, setView] = React.useState<any>(Views.WEEK);

    // Responsive View Handler
    React.useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setView(Views.DAY);
            } else {
                setView(Views.WEEK);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Custom Event Component
    const WeatherEvent = ({ event }: { event: SmartCalendarEvent }) => {
        const { resource } = event;
        // Format wind string: "5-10kt" or just "10kt"
        const windStr = resource.maxGust > resource.maxWind + 5
            ? `${resource.maxWind}G${resource.maxGust}`
            : `${resource.maxWind}`;

        return (
            <div className="flex flex-col items-center justify-center w-full h-full p-1 overflow-hidden">
                <div className="font-bold text-xs uppercase tracking-wider mb-0.5" style={{ fontSize: '0.7rem' }}>
                    {event.title}
                </div>

                {/* Weather Details (Only if space permits or on hover/larger views) */}
                <div className="flex flex-col gap-0.5 text-[10px] opacity-90 leading-tight items-center">
                    <div className="flex items-center gap-1">
                        <span role="img" aria-label="wind">💨</span>
                        {windStr}kt
                    </div>
                    <div className="flex items-center gap-1">
                        <span role="img" aria-label="cloud">☁️</span>
                        {resource.minCeiling > 10000 ? 'Unlim' : resource.minCeiling}
                    </div>
                </div>
            </div>
        );
    };

    // Custom Event Styling
    const eventPropGetter = (event: SmartCalendarEvent) => {
        const status = event.resource.status;
        let backgroundColor = '#3b82f6'; // blue

        if (status === 'GO') backgroundColor = '#10b981'; // green-500
        if (status === 'MARGINAL') backgroundColor = '#f59e0b'; // amber-500
        if (status === 'NO_GO') backgroundColor = '#ef4444'; // red-500

        return {
            style: {
                backgroundColor,
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: window.innerWidth < 768 ? '0.7rem' : '0.75rem',
                fontWeight: '600',
                display: 'block', // Changed to block for custom component
                padding: '0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                opacity: 0.95,
                overflow: 'hidden'
            }
        };
    };

    return (
        <div className="h-[600px] md:h-[850px] bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6 transition-colors">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                view={view}
                onView={setView}
                views={[Views.MONTH, Views.WEEK, Views.DAY]}
                step={60}
                showMultiDayTimes
                eventPropGetter={eventPropGetter}
                onSelectEvent={(event) => onSelectDay(event.start)}
                onSelectSlot={(slotInfo) => onSelectDay(slotInfo.start)}
                selectable
                tooltipAccessor={(e: any) =>
                    `${e.resource.status} (${e.resource.score})\nWind: ${e.resource.maxWind}kt\nCig: ${e.resource.minCeiling}ft`
                }
                components={{
                    toolbar: CalendarToolbar,
                    event: WeatherEvent // Use custom event component
                }}
            />
        </div>
    );
};
