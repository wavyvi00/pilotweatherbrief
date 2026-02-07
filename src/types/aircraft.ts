
export interface AircraftPerformance {
    cruiseSpeed: number; // TAS in Knots
    fuelBurn: number; // Gallons Per Hour
    usableFuel: number; // Total Usable Fuel in Gallons
    range: number; // Estimated Range in NM (Optional, can be calc'd)
}

export interface Aircraft {
    id: string;
    registration: string; // "N-Number"
    type: string; // e.g. "C172S"
    name: string; // Friendly name e.g. "Skyhawk"
    performance: AircraftPerformance;
    color?: string; // For UI identification
    requiredEndorsements?: string[]; // e.g. ['complex', 'high-performance']
}
