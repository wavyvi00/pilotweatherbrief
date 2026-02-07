
import { ScoringEngine } from '../src/logic/scoring';
import type { WeatherWindow } from '../src/types/weather';
import type { TrainingProfile } from '../src/types/profile';
import type { Aircraft } from '../src/types/aircraft';

// Mock Weather Window (VFR, Good Weather)
const mockWeather: WeatherWindow = {
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000),
    flightCategory: 'VFR',
    ceiling: 10000,
    visibility: 10,
    wind: { speed: 5, direction: 180, gust: 0 },
    temperature: 20,
    dewpoint: 10,
    altimeter: 29.92,
    densityAltitude: 1000,
    isDay: true,
    precipitationProbability: 0
};

// Mock Profile with Endorsements but NO aircraft requirements (legacy style)
const mockProfile: TrainingProfile = {
    id: 'test-profile',
    name: 'Test Pilot',
    limits: {
        maxWind: 20,
        maxGust: 25,
        maxCrosswind: 15,
        minCeiling: 3000,
        minVisibility: 5,
        allowIfr: false,
        allowNight: true
    },
    endorsements: ['complex', 'high-performance'], // Holds these
    aircraft: {
        requiredEndorsements: [] // None required by profile
    } as any
};

// Aircraft with Requirements
const tailwheelShip: Aircraft = {
    id: 'tw-1',
    registration: 'N123TW',
    type: 'C170',
    performance: { cruiseSpeed: 100, fuelBurn: 8 },
    requiredEndorsements: ['tailwheel']
};

const complexShip: Aircraft = {
    id: 'cx-1',
    registration: 'N123CX',
    type: 'PA28R',
    performance: { cruiseSpeed: 130, fuelBurn: 10 },
    requiredEndorsements: ['complex']
};

console.log('--- Verifying Aircraft Override ---');

// Case 1: No aircraft in context, Profile has no requirements -> GO
const res1 = ScoringEngine.calculateSuitability(mockWeather, mockProfile);
console.log(`1. No Aircraft Context (Expect GO): ${res1.status}`);

// Case 2: Tailwheel Aircraft (Pilot lacks endorsement) -> NO_GO
const res2 = ScoringEngine.calculateSuitability(mockWeather, mockProfile, { aircraft: tailwheelShip });
console.log(`2. Tailwheel Aircraft (Expect NO_GO): ${res2.status}`);
if (res2.status !== 'NO_GO') console.error('FAIL: Should be NO_GO for missing tailwheel');

// Case 3: Complex Aircraft (Pilot has endorsement) -> GO
const res3 = ScoringEngine.calculateSuitability(mockWeather, mockProfile, { aircraft: complexShip });
console.log(`3. Complex Aircraft (Expect GO): ${res3.status}`);

if (res1.status === 'GO' && res2.status === 'NO_GO' && res3.status === 'GO') {
    console.log('SUCCESS: Aircraft context correctly overrides scoring.');
} else {
    console.error('FAILURE: Scoring logic incorrect.');
    process.exit(1);
}
