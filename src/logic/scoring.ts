import type { WeatherWindow } from '../types/weather';
import type { TrainingProfile } from '../types/profile';

export interface SuitabilityResult {
    score: number; // 0-100
    status: 'GO' | 'MARGINAL' | 'NO_GO';
    reasons: string[]; // List of factors affecting the score
    primaryLimitingFactor?: string; // e.g. "Ceiling", "Wind"
}

export const ScoringEngine = {
    calculateSuitability(
        weather: WeatherWindow,
        profile: TrainingProfile,
        context?: {
            runwayHeading?: number;
            stationElevation?: number; // feet MSL
            maxRunwayLength?: number; // feet
        }
    ): SuitabilityResult {
        const limits = profile.limits;
        const reasons: string[] = [];
        let score = 100;

        // 1. Flight Rules Check
        if (!limits.allowIfr && (weather.flightCategory === 'IFR' || weather.flightCategory === 'LIFR')) {
            reasons.push(`Conditions are ${weather.flightCategory} (Instrument Rules)`);
            score = 0;
            return { score, status: 'NO_GO', reasons, primaryLimitingFactor: 'Flight Rules' };
        }

        // 2. Ceiling Check
        if (weather.ceiling < limits.minCeiling) {
            reasons.push(`Ceiling ${weather.ceiling}ft < Minimum ${limits.minCeiling}ft`);
            score = 0; // Hard fail
        } else if (weather.ceiling < limits.minCeiling + 1000) {
            // Penalize for being close to minimums
            score -= 20;
            reasons.push('Ceiling near minimums');
        }

        // 3. Visibility Check
        if (weather.visibility < limits.minVisibility) {
            reasons.push(`Visibility ${weather.visibility}sm < Minimum ${limits.minVisibility}sm`);
            score = 0;
        }

        // 4. Wind Check
        // Calculate Crosswind if runway provided, else use total wind
        let effectiveCrosswind = 0; // Unknown if no runway

        if (context?.runwayHeading !== undefined) {
            const angle = Math.abs(weather.wind.direction - context.runwayHeading);
            const rad = (angle * Math.PI) / 180;
            effectiveCrosswind = Math.abs(Math.sin(rad) * weather.wind.speed);

            // Crosswind Limit
            if (effectiveCrosswind > limits.maxCrosswind) {
                reasons.push(`Crosswind ${effectiveCrosswind.toFixed(1)}kt > Limit ${limits.maxCrosswind}kt`);
                score = 0;
            }
        }

        // Total Wind Limit
        if (weather.wind.speed > limits.maxWind) {
            reasons.push(`Wind ${weather.wind.speed}kt > Limit ${limits.maxWind}kt`);
            score = 0;
        }

        // Gust Limit
        if (weather.wind.gust > limits.maxGust) {
            reasons.push(`Gusts ${weather.wind.gust}kt > Limit ${limits.maxGust}kt`);
            score = 0;
        }

        // 5. Precip Probability (Linear Penalty)
        if (weather.precipitationProbability > 0) {
            if (weather.precipitationProbability > limits.maxPrecipProb) {
                reasons.push(`Precipitation Chance ${weather.precipitationProbability}% > Limit ${limits.maxPrecipProb}%`);
                score = Math.max(0, score - 50); // Heavy penalty
                if (score > 49) score = 49;
            } else {
                score -= weather.precipitationProbability / 2; // Minor penalty
            }
        }

        // 6. Temp/Dewpoint Spread (Fog Risk)
        if (weather.temperature !== undefined && weather.dewpoint !== undefined && limits.minTempSpread !== undefined) {
            const spread = weather.temperature - weather.dewpoint;
            if (spread < limits.minTempSpread) {
                reasons.push(`Temp/Dewpoint Spread ${spread.toFixed(1)}°C < Minimum ${limits.minTempSpread}°C (Fog Risk)`);
                // If visibility is already low, this duplicates, but it warns of *potential* getting worse
                // Warn but don't hard fail unless visibility is also low?
                // Let's degrade score significantly
                score -= 30;
                if (score < 60) score = 55; // Ensure at least marginal
            }
        }

        // 7. Density Altitude
        if (context?.stationElevation !== undefined && weather.temperature !== undefined && weather.altimeter !== undefined && limits.maxDensityAltitude !== undefined) {
            // Calculate DA
            // Pressure Altitude = (29.92 - Altimeter) * 1000 + Elevation
            const pressureAltitude = (29.92 - weather.altimeter) * 1000 + context.stationElevation;
            // ISA Temp at Pressure Altitude = 15 - (2 * PA/1000)
            const isaTemp = 15 - (2 * (pressureAltitude / 1000));
            // DA = PA + [120 * (OAT - ISA)]
            const da = pressureAltitude + (120 * (weather.temperature - isaTemp));

            // Attach derived DA to weather window for display? (Ideally, but WeatherWindow is raw)
            // We just score it here.

            if (da > limits.maxDensityAltitude) {
                reasons.push(`Density Altitude ${Math.round(da)}ft > Limit ${limits.maxDensityAltitude}ft`);
                score = 0;
            } else if (da > limits.maxDensityAltitude - 1000) {
                // Warning zone
                score -= 15;
                reasons.push(`High Density Altitude (${Math.round(da)}ft)`);
            }
        }

        // 8. Runway Length
        if (context?.maxRunwayLength !== undefined && limits.minRunwayLength !== undefined) {
            if (context.maxRunwayLength < limits.minRunwayLength) {
                reasons.push(`Max Runway Length ${context.maxRunwayLength}ft < Minimum ${limits.minRunwayLength}ft`);
                score = 0;
            }
        }

        // 9. Freezing Level
        if (weather.freezingLevel !== undefined && limits.minFreezingLevel !== undefined) {
            if (weather.freezingLevel < limits.minFreezingLevel) {
                reasons.push(`Freezing Level ${Math.round(weather.freezingLevel)}ft < Minimum ${limits.minFreezingLevel}ft`);
                // Icing risk is serious. If below mins, huge penalty or NO_GO.
                // Assuming this minimum means "Don't fly if freezing level is lower than X" (implying we want to stay below it? or above it?)
                // Usually VFR pilots want freezing level HIGH so they don't encounter ice in clouds slightly above.
                // So "minFreezingLevel" means "Freezing level must be at least X feet" (e.g. 5000ft).
                // If actual is 2000ft, that's bad.
                score = 0;
            } else if (weather.freezingLevel < limits.minFreezingLevel + 2000) {
                // Warning buffer
                reasons.push(`Freezing Level (${Math.round(weather.freezingLevel)}ft) Low`);
                score -= 20;
            }
        }

        // 10. Night Flight
        if (weather.isDay === false && !limits.allowNight) {
            reasons.push('Night Flight Not Allowed');
            score = 0;
        }

        // Determine Status
        let status: 'GO' | 'MARGINAL' | 'NO_GO' = 'GO';
        if (score < 50) status = 'NO_GO';
        else if (score < 80) status = 'MARGINAL';

        // Normalize Score
        score = Math.max(0, Math.round(score));

        return {
            score,
            status,
            reasons,
            primaryLimitingFactor: reasons.length > 0 ? reasons[0].split(' ')[0] : undefined
        };
    }
};
