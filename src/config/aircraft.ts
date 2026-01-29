
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
            range: 630
        },
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
            range: 350
        },
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
            range: 520
        },
        color: 'indigo'
    }
];
