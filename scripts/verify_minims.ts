
import { ScoringEngine } from '../src/logic/scoring';
import { DEFAULT_PROFILES } from '../src/config/profiles';
import { WeatherWindow } from '../src/types/weather';

const profile = DEFAULT_PROFILES.find(p => p.id === 'student-solo-pattern');

if (!profile) {
    console.error('Profile not found');
    process.exit(1);
}

// Mock base weather (Good conditions)
const baseWeather: WeatherWindow = {
    startTime: new Date(),
    endTime: new Date(),
    isForecast: true,
    wind: { direction: 180, speed: 5, gust: 0 },
    visibility: 10,
    ceiling: 10000,
    flightCategory: 'VFR',
    precipitationProbability: 0,
    source: 'OPEN_METEO',
    temperature: 20,
    dewpoint: 10,
    altimeter: 29.92,
    freezingLevel: 10000,
    isDay: true
};

console.log('--- Verification Started ---');

// Test 1: Night Flight (Should Fail)
const nightWeather = { ...baseWeather, isDay: false };
const nightResult = ScoringEngine.calculateSuitability(nightWeather, profile);
if (nightResult.status === 'NO_GO' && nightResult.reasons.includes('Night Flight Not Allowed')) {
    console.log('✅ Night Flight Logic: PASSED');
} else {
    console.error('❌ Night Flight Logic: FAILED', nightResult);
}

// Test 2: Low Freezing Level (Should Fail)
// Profile limit is 5000ft. Weather is 2000ft.
const coldWeather = { ...baseWeather, freezingLevel: 2000 };
const coldResult = ScoringEngine.calculateSuitability(coldWeather, profile);
if (coldResult.status === 'NO_GO' && coldResult.reasons.some(r => r.includes('Freezing Level'))) {
    console.log('✅ Freezing Level Logic: PASSED');
} else {
    console.error('❌ Freezing Level Logic: FAILED', coldResult);
}

// Test 3: Good Weather (Should Pass)
const goodResult = ScoringEngine.calculateSuitability(baseWeather, profile);
if (goodResult.status === 'GO') {
    console.log('✅ Good Weather Logic: PASSED');
} else {
    console.error('❌ Good Weather Logic: FAILED', goodResult);
}

// Test 4: Missing Endorsement (Should Fail)
const complexProfile = {
    ...profile,
    endorsements: [],
    aircraft: {
        ...profile.aircraft!,
        requiredEndorsements: ['complex']
    }
};

const endoResult = ScoringEngine.calculateSuitability(baseWeather, complexProfile);
if (endoResult.status === 'NO_GO' && endoResult.reasons.some(r => r.includes('Missing Endorsements'))) {
    console.log('✅ Missing Endorsement Logic: PASSED');
    console.log(`   Reason: ${endoResult.reasons[0]}`);
} else {
    console.error('❌ Missing Endorsement Logic: FAILED', endoResult);
}

// Test 5: Has Endorsement (Should Pass)
const qualifiedProfile = {
    ...complexProfile,
    endorsements: ['complex']
};
const qualifiedResult = ScoringEngine.calculateSuitability(baseWeather, qualifiedProfile);
if (qualifiedResult.status === 'GO') {
    console.log('✅ Has Endorsement Logic: PASSED');
} else {
    console.error('❌ Has Endorsement Logic: FAILED', qualifiedResult);
}

console.log('--- Verification Completed ---');
