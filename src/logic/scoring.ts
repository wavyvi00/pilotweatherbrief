import type { WeatherWindow } from '../types/weather';
import type { TrainingProfile } from '../types/profile';

export interface SuitabilityResult {
    score: number; // 0-100
    status: 'GO' | 'MARGINAL' | 'NO_GO';
    reasons: string[]; // List of factors affecting the score
    primaryLimitingFactor?: string; // e.g. "Ceiling", "Wind"
}

export const ScoringEngine = {
    calculateSuitability(weather: WeatherWindow, profile: TrainingProfile, runwayHeading?: number): SuitabilityResult {
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

        if (runwayHeading !== undefined) {
            const angle = Math.abs(weather.wind.direction - runwayHeading);
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
