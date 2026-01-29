export interface TrainingLimits {
    maxWind: number; // knots
    maxGust: number; // knots
    maxCrosswind: number; // knots
    minCeiling: number; // feet AGL
    minVisibility: number; // statute miles
    allowIfr: boolean; // if true, allows IFR/LIFR (with penalties maybe?)
    maxPrecipProb: number; // %
}

export interface TrainingProfile {
    id: string;
    name: string;
    description: string;
    limits: TrainingLimits;
    aircraft?: {
        cruiseSpeed: number; // knots TAS
        fuelBurn: number; // gph
        range: number; // nm
    };
}
