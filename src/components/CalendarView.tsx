import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import type { WeatherWindow } from '../types/weather';
import type { TrainingProfile } from '../types/profile';
import { ScoringEngine } from '../logic/scoring';
import clsx from 'clsx';
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

    // Transform WeatherWindows into Calendar Events
    const events = useMemo(() => {
        return windows.map(win => {
            const result = ScoringEngine.calculateSuitability(win, profile);
            return {
                title: `${result.score}`, // Minimal title
                start: win.startTime,
                end: win.endTime,
                resource: result,
            };
        });
    }, [windows, profile]);

    // Custom Event Styling
    const eventPropGetter = (event: any) => {
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
                fontSize: '0.8rem',
                textAlign: 'center',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }
        };
    };

    return (
        <div className="h-[850px] bg-white rounded-xl shadow-sm border border-slate-200 p-4">
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
            />
        </div>
    );
};
