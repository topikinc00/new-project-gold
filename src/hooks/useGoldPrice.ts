import { useState, useEffect } from 'react';

const BASE_PRICE_PER_GRAM = 1200000; // Initial base price in IDR

export function useGoldPrice() {
  const [pricePerGram, setPricePerGram] = useState(BASE_PRICE_PER_GRAM);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [change, setChange] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPricePerGram((prev) => {
        // Fluctuate price by +/- 0.05%
        const fluctuation = (Math.random() - 0.5) * 0.001 * prev;
        const newPrice = prev + fluctuation;
        setChange(fluctuation);
        setLastUpdate(new Date());
        return Math.round(newPrice);
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return { pricePerGram, lastUpdate, change };
}
