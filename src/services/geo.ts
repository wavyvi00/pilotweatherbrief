
/**
 * Calculates Great Circle Distance between two coordinates (Haversine)
 * @param lat1 
 * @param lon1 
 * @param lat2 
 * @param lon2 
 * @returns Distance in Nautical Miles (NM)
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3440.065; // Earth radius in NM
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
};

export const calculateETE = (distanceNm: number, speedKnots: number): number => {
    if (speedKnots <= 0) return 0;
    return distanceNm / speedKnots; // hours
};

export const formatDuration = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
};
