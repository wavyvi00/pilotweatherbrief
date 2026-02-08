
import { useState, useEffect } from 'react';
import { FuelService, type FuelPrice } from '../services/fuel';

export const useFuelPrice = (stationId: string | null) => {
    const [price, setPrice] = useState<FuelPrice | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!stationId) {
            setPrice(null);
            return;
        }

        let isMounted = true;
        setLoading(true);

        FuelService.getPrice(stationId)
            .then(data => {
                if (isMounted) {
                    setPrice(data);
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error('Fuel fetch failed', err);
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, [stationId]);

    return { price, loading };
};
