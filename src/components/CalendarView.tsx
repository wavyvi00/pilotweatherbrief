import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { WeatherWindow } from '../types/weather';
import type { TrainingProfile } from '../types/profile';
import { ScoringEngine } from '../logic/scoring';
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

interface GroupedEvent {
    start: Date;
    end: Date;
    status: string;
    scoreSum: number;
    count: number;
    resource: any;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ windows, profile, onSelectDay }) => {

    // Transform WeatherWindows into Smart Calendar Events (Grouped)
    const events = useMemo(() => {
        if (!windows.length) return [];

        const sortedWindows = [...windows].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        const groupedEvents: any[] = [];
        let currentGroup: GroupedEvent | null = null;

        for (const win of sortedWindows) {
            const result = ScoringEngine.calculateSuitability(win, profile);

            if (currentGroup) {
                // Check if contiguous (less than 90 mins gap to be safe for hourly) AND same status
                const isContiguous = (win.startTime.getTime() - currentGroup.end.getTime()) < 90 * 60 * 1000;
                const isSameStatus = result.status === currentGroup.status;

                if (isContiguous && isSameStatus) {
                    // Extend group
                    currentGroup.end = win.endTime;
                    currentGroup.scoreSum += result.score;
                    currentGroup.count += 1;
                    continue;
                } else {
                    // Commit previous group
                    groupedEvents.push({
                        title: currentGroup.count > 1 ? `${currentGroup.status} (${Math.round(currentGroup.scoreSum / currentGroup.count)})` : `${currentGroup.resource.score}`,
                        start: currentGroup.start,
                        end: currentGroup.end,
                        resource: { ...currentGroup.resource, score: Math.round(currentGroup.scoreSum / currentGroup.count) },
                    });
                    currentGroup = null;
                }
            }

            // Start new group
            currentGroup = {
                start: win.startTime,
                end: win.endTime,
                status: result.status,
                scoreSum: result.score,
                count: 1,
                resource: result
            };
        }

        // Push final group
        if (currentGroup) {
            groupedEvents.push({
                title: currentGroup.count > 1 ? `${currentGroup.status}` : `${currentGroup.resource.score}`,
                start: currentGroup.start,
                end: currentGroup.end,
                resource: { ...currentGroup.resource, score: Math.round(currentGroup.scoreSum / currentGroup.count) },
            });
        }

        return groupedEvents;
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
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }
        };
    };

    return (
        <div className="h-[850px] bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
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
