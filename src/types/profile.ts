export interface TrainingLimits {
    maxWind: number; // knots
    maxGust: number; // knots
    maxCrosswind: number; // knots
    minCeiling: number; // feet AGL
    minVisibility: number; // statute miles
    allowIfr: boolean; // if true, allows IFR/LIFR (with penalties maybe?)
    maxPrecipProb: number; // %
    minTempSpread: number; // Celsius (Temp - Dewpoint)
    maxDensityAltitude: number; // feet
    minRunwayLength: number; // feet
    minFreezingLevel: number; // feet MSL
    allowNight: boolean;
    minFuelReserve: number; // minutes
}

export interface TrainingProfile {
    id: string;
    name: string;
    description: string;
    limits: TrainingLimits;
    endorsements: string[]; // Endorsements held by the pilot in this profile
    totalHours: number; // Total flight experience in hours
    aircraft?: {
        cruiseSpeed: number; // knots TAS
        fuelBurn: number; // gph
        range: number; // nm
        requiredEndorsements?: string[]; // Endorsements required to fly this aircraft
    };
}
