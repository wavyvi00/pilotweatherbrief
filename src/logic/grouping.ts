import type { WeatherWindow } from '../types/weather';
import type { TrainingProfile } from '../types/profile';
import type { Aircraft } from '../types/aircraft';
import { ScoringEngine, type SuitabilityResult } from './scoring';

export interface GroupedEventResource extends SuitabilityResult {
    // Aggregated stats for the group
    maxWind: number;
    maxGust: number;
    minCeiling: number;
    minVisibility: number;
}

export interface SmartCalendarEvent {
    title: string;
    start: Date;
    end: Date;
    resource: GroupedEventResource;
}

interface GroupAccumulator {
    start: Date;
    end: Date;
    status: string;
    scoreSum: number;
    count: number;
    resource: SuitabilityResult;
    // Track extremes
    maxWind: number;
    maxGust: number;
    minCeiling: number;
    minVisibility: number;
}

/**
 * Groups contiguous weather windows with the same suitability status into single calendar events.
 * This effectively "de-noises" the calendar by merging 5 separate "GO" hours into one 5-hour "GO" block.
 */
export function groupWeatherWindows(windows: WeatherWindow[], profile: TrainingProfile, aircraft?: Aircraft): SmartCalendarEvent[] {
    if (!windows.length) return [];

    const sortedWindows = [...windows].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    const groupedEvents: SmartCalendarEvent[] = [];
    let currentGroup: GroupAccumulator | null = null;

    for (const win of sortedWindows) {
        const result = ScoringEngine.calculateSuitability(win, profile, { aircraft });

        if (currentGroup) {
            // Check if contiguous (less than 90 mins gap allows for hourly data slightly off-tick) AND same status
            const isContiguous = (win.startTime.getTime() - currentGroup.end.getTime()) < 90 * 60 * 1000;
            const isSameStatus = result.status === currentGroup.status;

            if (isContiguous && isSameStatus) {
                // Extend the current group
                currentGroup.end = win.endTime;
                currentGroup.scoreSum += result.score;
                currentGroup.count += 1;

                // Update extremes
                currentGroup.maxWind = Math.max(currentGroup.maxWind, win.wind.speed);
                currentGroup.maxGust = Math.max(currentGroup.maxGust, win.wind.gust);
                currentGroup.minCeiling = Math.min(currentGroup.minCeiling, win.ceiling);
                currentGroup.minVisibility = Math.min(currentGroup.minVisibility, win.visibility);

                continue;
            } else {
                // Commit the finished group
                groupedEvents.push(finalizeGroup(currentGroup));
                currentGroup = null;
            }
        }

        // Start a new group
        currentGroup = {
            start: win.startTime,
            end: win.endTime,
            status: result.status,
            scoreSum: result.score,
            count: 1,
            resource: result,
            maxWind: win.wind.speed,
            maxGust: win.wind.gust,
            minCeiling: win.ceiling,
            minVisibility: win.visibility
        };
    }

    // Push the final group if one exists
    if (currentGroup) {
        groupedEvents.push(finalizeGroup(currentGroup));
    }

    return groupedEvents;
}

function finalizeGroup(group: GroupAccumulator): SmartCalendarEvent {
    const avgScore = Math.round(group.scoreSum / group.count);

    // Title logic: If spans multiple hours, show Status + Avg Score. If single hour, just show Score.
    // This keeps the calendar tile clean.
    const title = group.count > 1
        ? `${group.status} (${avgScore})`
        : `${group.resource.score}`;

    return {
        title,
        start: group.start,
        end: group.end,
        resource: {
            ...group.resource,
            score: avgScore,
            maxWind: group.maxWind,
            maxGust: group.maxGust,
            minCeiling: group.minCeiling,
            minVisibility: group.minVisibility
        },
    };
}
