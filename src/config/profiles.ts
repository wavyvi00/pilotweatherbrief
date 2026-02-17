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
        totalHours: 20,
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
        totalHours: 40,
        aircraft: { cruiseSpeed: 110, fuelBurn: 9, range: 500, requiredEndorsements: [] }
    }, ,
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
        totalHours: 500,
        aircraft: { cruiseSpeed: 120, fuelBurn: 10, range: 600, requiredEndorsements: [] }
    },
    {
        id: 'instrument-training',
        name: 'Instrument Training (IFR)',
        description: 'For IFR-rated pilots or dual IFR training.',
        limits: {
            maxWind: 25,
            maxGust: 30,
            maxCrosswind: 15,
            minCeiling: 500, // IFR minimums
            minVisibility: 1,
            allowIfr: true,
            maxPrecipProb: 70, // Rain is okay, just no thunderstorms
            minTempSpread: 1,
            maxDensityAltitude: 6000,
            minRunwayLength: 3000,
            minFreezingLevel: 0, // Avoid icing
            allowNight: true,
            minFuelReserve: 60 // 45 min + extra cushion
        },
        endorsements: ['instrument'],
        totalHours: 150,
        aircraft: { cruiseSpeed: 120, fuelBurn: 10, range: 600, requiredEndorsements: [] }
    },
    {
        id: 'night-vfr',
        name: 'Night VFR',
        description: 'Local night currency or training.',
        limits: {
            maxWind: 15,
            maxGust: 20,
            maxCrosswind: 10,
            minCeiling: 3000,
            minVisibility: 5, // Higher vis for night
            allowIfr: false,
            maxPrecipProb: 30,
            minTempSpread: 4, // Avoid night fog
            maxDensityAltitude: 4000,
            minRunwayLength: 3000,
            minFreezingLevel: 3000,
            allowNight: true,
            minFuelReserve: 45
        },
        endorsements: [],
        totalHours: 100,
        aircraft: { cruiseSpeed: 110, fuelBurn: 9, range: 500, requiredEndorsements: [] }
    }, ,
    {
        id: 'commercial-maneuvers',
        name: 'Commercial Maneuvers',
        description: 'Time building and precision flying.',
        limits: {
            maxWind: 25,
            maxGust: 30,
            maxCrosswind: 17, // Higher crosswind proficiency
            minCeiling: 3000,
            minVisibility: 5,
            allowIfr: false,
            maxPrecipProb: 40,
            minTempSpread: 3,
            maxDensityAltitude: 6000,
            minRunwayLength: 2000,
            minFreezingLevel: 3000,
            allowNight: true,
            minFuelReserve: 45
        },
        endorsements: ['commercial'],
        totalHours: 250,
        aircraft: { cruiseSpeed: 130, fuelBurn: 12, range: 600, requiredEndorsements: ['complex'] }
    },
    {
        id: 'discovery-flight',
        name: 'Discovery Flight 乘客',
        description: 'Smooth air only for passenger comfort.',
        limits: {
            maxWind: 10,
            maxGust: 0, // No gusts
            maxCrosswind: 5,
            minCeiling: 4000, // Good views
            minVisibility: 10, // Excellent visibility
            allowIfr: false,
            maxPrecipProb: 10,
            minTempSpread: 5,
            maxDensityAltitude: 3000,
            minRunwayLength: 4000, // Extra margin
            minFreezingLevel: 5000,
            allowNight: false,
            minFuelReserve: 60
        },
        endorsements: [],
        totalHours: 50,
        aircraft: { cruiseSpeed: 100, fuelBurn: 8, range: 300, requiredEndorsements: [] }
    }
];
