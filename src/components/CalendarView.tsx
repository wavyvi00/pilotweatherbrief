import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { WeatherWindow } from '../types/weather';
import type { TrainingProfile } from '../types/profile';
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
    onSelectDay: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ windows, profile, onSelectDay }) => {

    // Transform WeatherWindows into Smart Calendar Events (Grouped)
    const events = useMemo(() => {
        return groupWeatherWindows(windows, profile);
    }, [windows, profile]);

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
                borderRadius: '4px',
                color: 'white',
                fontSize: window.innerWidth < 768 ? '0.7rem' : '0.75rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px 4px',
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                opacity: 0.95
            }
        };
    };

    return (
        <div className="h-[600px] md:h-[850px] bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
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
                tooltipAccessor={(e: any) => `${e.resource.status} (${e.resource.score})`}
                components={{
                    toolbar: CalendarToolbar
                }}
            />
        </div>
    );
};
