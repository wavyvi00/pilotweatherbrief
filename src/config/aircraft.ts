
import type { Aircraft } from '../types/aircraft';

export const DEFAULT_AIRCRAFT: Aircraft[] = [
    {
        id: 'c172s-default',
        registration: 'N172SP',
        type: 'C172S',
        name: 'Skyhawk SP',
        performance: {
            cruiseSpeed: 115,
            fuelBurn: 9.5,
            usableFuel: 53,
            range: 630,
            emptyWeight: 1665,
            emptyArm: 39.6, // C172S Typical
            maxGrossWeight: 2550
        },
        stations: [
            { id: 'pilot', name: 'Pilot & Pax', arm: 37, maxWeight: 400 },
            { id: 'rear', name: 'Rear Pax', arm: 73, maxWeight: 400 },
            { id: 'bag1', name: 'Baggage 1', arm: 95, maxWeight: 120 },
            { id: 'bag2', name: 'Baggage 2', arm: 123, maxWeight: 50 },
            { id: 'fuel', name: 'Fuel', arm: 48, maxWeight: 318 } // 53 * 6
        ],
        cgEnvelope: [
            { weight: 1600, arm: 35 }, { weight: 2550, arm: 41 }, 
            { weight: 2550, arm: 47.3 }, { weight: 1600, arm: 47.3 }
        ],
        color: 'sky'
    },
    {
        id: 'c152-default',
        registration: 'N152AB',
        type: 'C152',
        name: 'Commuter',
        performance: {
            cruiseSpeed: 95,
            fuelBurn: 6,
            usableFuel: 24,
            range: 350,
            emptyWeight: 1100,
            emptyArm: 32.0, // C152 Typical
            maxGrossWeight: 1670
        },
        stations: [],
        cgEnvelope: [],
        color: 'emerald'
    },
    {
        id: 'pa28-default',
        registration: 'N28PA',
        type: 'PA-28-181',
        name: 'Archer III',
        performance: {
            cruiseSpeed: 125,
            fuelBurn: 10.5,
            usableFuel: 48,
            range: 520,
            emptyWeight: 1590,
            emptyArm: 85.0, // PA-28 Typical (Datum is 78.4" ahead of wing leading edge)
            maxGrossWeight: 2550
        },
        stations: [],
        cgEnvelope: [],
        color: 'indigo'
    }
];
