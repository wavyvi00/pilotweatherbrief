/**
 * Type of stop at intermediate waypoints
 */
export type StopType = 'fuel' | 'full-stop' | 'stop-and-go' | 'touch-and-go';

/**
 * Represents a single waypoint in a route
 */
export interface RouteWaypoint {
    /** ICAO code of the airport */
    icao: string;
    /** Type of waypoint in the route */
    type: 'departure' | 'waypoint' | 'destination';
    /** Optional stop type for intermediate waypoints */
    stopType?: StopType;
}

/**
 * A route is an ordered array of waypoints
 * Minimum 2 waypoints (departure + destination)
 * Can have any number of intermediate waypoints
 */
export type Route = RouteWaypoint[];

/**
 * Represents a single leg between two consecutive waypoints
 */
export interface RouteLeg {
    from: string;
    to: string;
    distanceNm: number;
    eteHours: number;
    legIndex: number;
}

/**
 * Create an empty route with just departure
 */
export const createEmptyRoute = (departureIcao: string = ''): Route => [
    { icao: departureIcao, type: 'departure' }
];

/**
 * Create a simple A→B route
 */
export const createSimpleRoute = (from: string, to: string): Route => [
    { icao: from, type: 'departure' },
    { icao: to, type: 'destination' }
];

/**
 * Add a waypoint before the destination
 */
export const addWaypoint = (route: Route, icao: string = '', stopType: StopType = 'full-stop'): Route => {
    if (route.length < 2) {
        // No destination yet, just add as destination
        return [...route, { icao, type: 'destination' }];
    }

    // Insert before the last item (destination)
    const newRoute = [...route];
    const destination = newRoute.pop()!;

    // Change destination to waypoint if adding after it
    newRoute.push({ icao, type: 'waypoint', stopType });
    newRoute.push(destination);

    return newRoute;
};

/**
 * Remove a waypoint at the specified index
 * Cannot remove departure (index 0) or destination (last index)
 */
export const removeWaypoint = (route: Route, index: number): Route => {
    if (index === 0 || index >= route.length - 1) {
        return route; // Can't remove departure or destination
    }

    return route.filter((_, i) => i !== index);
};

/**
 * Update a waypoint's ICAO code
 */
export const updateWaypoint = (route: Route, index: number, icao: string): Route => {
    return route.map((wp, i) =>
        i === index ? { ...wp, icao } : wp
    );
};

/**
 * Check if route has a valid destination (at least 2 waypoints with ICAOs)
 */
export const hasValidDestination = (route: Route): boolean => {
    return route.length >= 2 &&
        route[0].icao.length >= 3 &&
        route[route.length - 1].icao.length >= 3;
};

/**
 * Get all unique ICAO codes from the route
 */
export const getRouteIcaos = (route: Route): string[] => {
    return route
        .map(wp => wp.icao)
        .filter(icao => icao.length >= 3);
};
