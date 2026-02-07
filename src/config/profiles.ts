import type { TrainingProfile } from '../types/profile';

export const DEFAULT_PROFILES: TrainingProfile[] = [
    {
        id: 'student-solo-pattern',
        name: 'Student Solo (Pattern)',
        description: 'Conservative limits for early solo pattern work.',
        limits: {
            maxWind: 10,
            maxGust: 15,
            maxCrosswind: 5,
            minCeiling: 2000,
            minVisibility: 5,
            allowIfr: false,
            maxPrecipProb: 30,
            minTempSpread: 3, // Standard margin
            maxDensityAltitude: 3000,
            minRunwayLength: 3000,
            minFreezingLevel: 5000,
            allowNight: false,
            minFuelReserve: 45
        },
        endorsements: [],
        aircraft: { cruiseSpeed: 100, fuelBurn: 8, range: 400, requiredEndorsements: [] }
    },
    {
        id: 'student-solo-xc',
        name: 'Student Solo (XC)',
        description: 'Limits for cross-country solo flights.',
        limits: {
            maxWind: 12,
            maxGust: 18,
            maxCrosswind: 8,
            minCeiling: 3000,
            minVisibility: 8,
            allowIfr: false,
            maxPrecipProb: 20,
            minTempSpread: 3,
            maxDensityAltitude: 4000,
            minRunwayLength: 2500,
            minFreezingLevel: 4000,
            allowNight: false,
            minFuelReserve: 45
        },
        endorsements: [],
        aircraft: { cruiseSpeed: 110, fuelBurn: 9, range: 500, requiredEndorsements: [] }
    },
    {
        id: 'instruction-dual',
        name: 'Dual Instruction',
        description: 'Higher limits for flights with an instructor.',
        limits: {
            maxWind: 20,
            maxGust: 25,
            maxCrosswind: 15,
            minCeiling: 1000, // MVFR is okay for patterns
            minVisibility: 3,
            allowIfr: false, // VFR training assumed usually
            maxPrecipProb: 60,
            minTempSpread: 2,
            maxDensityAltitude: 5000,
            minRunwayLength: 2000,
            minFreezingLevel: 2000,
            allowNight: true,
            minFuelReserve: 30
        },
        endorsements: ['complex', 'high-performance'], // Instructor assumed to have these
        aircraft: { cruiseSpeed: 120, fuelBurn: 10, range: 600, requiredEndorsements: [] }
    }
];
