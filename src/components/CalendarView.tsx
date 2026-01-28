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
                borderRadius: '0px',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: '600',
                display: 'flex',
                flexDirection: 'column' as 'column',
                alignItems: 'flex-start',
                padding: '4px 8px',
                boxShadow: 'none',
                opacity: 0.95
            }
        };
    };

    return (
        <div className="h-[850px] bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                defaultView={Views.WEEK}
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
