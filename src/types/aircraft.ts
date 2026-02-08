
export interface AircraftPerformance {
    cruiseSpeed: number; // TAS in Knots
    fuelBurn: number; // Gallons Per Hour
    usableFuel: number; // Total Usable Fuel in Gallons
    range: number; // Estimated Range in NM (Optional, can be calc'd)
    // W&B Base Data
    emptyWeight: number; // lbs
    maxGrossWeight: number; // lbs
}

export interface Station {
    id: string;
    name: string;
    arm: number; // inches
    maxWeight: number; // lbs
}

export interface CGEnvelopePoint {
    weight: number;
    arm: number;
}

export interface Aircraft {
    id: string;
    registration: string; // "N-Number"
    type: string; // e.g. "C172S"
    name: string; // Friendly name e.g. "Skyhawk"
    performance: AircraftPerformance;
    // W&B Configuration
    stations: Station[];
    cgEnvelope: CGEnvelopePoint[]; // Polygon of the Normal Category envelope
    
    color?: string; // For UI identification
    requiredEndorsements?: string[]; // e.g. ['complex', 'high-performance']
}
