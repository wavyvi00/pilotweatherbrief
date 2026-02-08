
// Mock service for fuel prices
// In a real app, this would fetch from an API like globalair.com or 100ll.com

export interface FuelPrice {
    stationId: string;
    price: number;
    updated: string; // ISO date
    type: 'Self Serve' | 'Full Service' | 'Unknown';
}

const REGIONAL_AVERAGE = 6.45;

// Some realistic mock data for key airports
const MOCK_PRICES: Record<string, number> = {
    'K00C': 5.85,
    'KAPA': 7.12,
    'KBJC': 6.95,
    'KGXY': 5.45,
    'KFNL': 6.10,
    'KCFO': 5.95,
    'ME05': 4.50, // Cheap fuel!
};

export const FuelService = {
    async getPrice(stationId: string): Promise<FuelPrice> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));

        const basePrice = MOCK_PRICES[stationId] || (REGIONAL_AVERAGE + (Math.random() * 1.5 - 0.75));
        
        // Randomly assign service type based on price
        const isSelfServe = basePrice < 6.50;

        return {
            stationId,
            price: Number(basePrice.toFixed(2)),
            updated: new Date().toISOString(),
            type: isSelfServe ? 'Self Serve' : 'Full Service'
        };
    }
};
