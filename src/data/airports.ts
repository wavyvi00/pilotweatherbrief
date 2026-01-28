export interface Airport {
    icao: string;
    name: string;
    city: string;
    state: string;
    lat: number;
    lon: number;
}

export const AIRPORTS: Airport[] = [
    { icao: "KMCI", name: "Kansas City International", city: "Kansas City", state: "MO", lat: 39.297, lon: -94.713 },
    { icao: "KMKC", name: "Charles B. Wheeler Downtown", city: "Kansas City", state: "MO", lat: 39.123, lon: -94.593 },
    { icao: "KOJC", name: "Johnson County Executive", city: "Olathe", state: "KS", lat: 38.853, lon: -94.741 },
    { icao: "KIXD", name: "New Century Aircenter", city: "Olathe", state: "KS", lat: 38.831, lon: -94.893 },
    { icao: "KSTJ", name: "Rosecrans Memorial", city: "St Joseph", state: "MO", lat: 39.771, lon: -94.910 },
    { icao: "KFLV", name: "Sherman Army Airfield", city: "Fort Leavenworth", state: "KS", lat: 39.368, lon: -94.914 },
    { icao: "KLWC", name: "Lawrence Municipal", city: "Lawrence", state: "KS", lat: 39.014, lon: -95.213 },
    { icao: "KTOP", name: "Philip Billard Municipal", city: "Topeka", state: "KS", lat: 39.068, lon: -95.623 },
    { icao: "KFOE", name: "Topeka Regional", city: "Topeka", state: "KS", lat: 38.951, lon: -95.663 },
    { icao: "KEMP", name: "Emporia Municipal", city: "Emporia", state: "KS", lat: 38.333, lon: -96.193 },
    { icao: "KHKY", name: "Hickory Regional", city: "Hickory", state: "NC", lat: 35.741, lon: -81.390 },
    { icao: "KCLT", name: "Charlotte Douglas Intl", city: "Charlotte", state: "NC", lat: 35.214, lon: -80.943 },
    { icao: "KJQF", name: "Concord-Padgett Regional", city: "Concord", state: "NC", lat: 35.387, lon: -80.709 },
    { icao: "KOSH", name: "Wittman Regional", city: "Oshkosh", state: "WI", lat: 43.984, lon: -88.557 },
    { icao: "KSUN", name: "Friedman Memorial", city: "Hailey", state: "ID", lat: 43.504, lon: -114.296 },
    { icao: "KVNY", name: "Van Nuys", city: "Van Nuys", state: "CA", lat: 34.209, lon: -118.489 },
    { icao: "KAPA", name: "Centennial", city: "Denver", state: "CO", lat: 39.570, lon: -104.849 },
    { icao: "KSFO", name: "San Francisco Intl", city: "San Francisco", state: "CA", lat: 37.619, lon: -122.375 },
    { icao: "KJFK", name: "John F Kennedy Intl", city: "New York", state: "NY", lat: 40.639, lon: -73.778 },
    { icao: "KORD", name: "Chicago O'Hare Intl", city: "Chicago", state: "IL", lat: 41.978, lon: -87.904 },
    { icao: "KFME", name: "Tipton", city: "Fort Meade", state: "MD", lat: 39.085, lon: -76.759 }, // Requested by user
    { icao: "KGAI", name: "Montgomery County Airpark", city: "Gaithersburg", state: "MD", lat: 39.168, lon: -77.166 },
    { icao: "KBWI", name: "Baltimore/Washington Intl", city: "Baltimore", state: "MD", lat: 39.175, lon: -76.668 },
    { icao: "KDCA", name: "Ronald Reagan Washington National", city: "Washington", state: "DC", lat: 38.852, lon: -77.037 },
    { icao: "KIAD", name: "Washington Dulles Intl", city: "Dulles", state: "VA", lat: 38.944, lon: -77.455 },
    { icao: "KGIF", name: "Winter Haven Regional", city: "Winter Haven", state: "FL", lat: 28.061, lon: -81.752 },
    { icao: "KMCO", name: "Orlando International", city: "Orlando", state: "FL", lat: 28.429, lon: -81.309 },
    { icao: "KORL", name: "Orlando Executive", city: "Orlando", state: "FL", lat: 28.545, lon: -81.333 },
    { icao: "KTPA", name: "Tampa International", city: "Tampa", state: "FL", lat: 27.975, lon: -82.533 },
    { icao: "KSPG", name: "Albert Whitted", city: "St. Petersburg", state: "FL", lat: 27.765, lon: -82.626 }
];
