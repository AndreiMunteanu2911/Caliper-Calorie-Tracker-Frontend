import { useCallback, useState } from 'react';

import { apiRequest } from '@/src/lib/api-client';
import type { FoodItem } from '@/src/types/api';

export function useBarcodeLookup() {
  const [item, setItem] = useState<FoodItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastBarcode, setLastBarcode] = useState<string | null>(null);

  const lookup = useCallback(
    async (barcode: string) => {
      if (!barcode || barcode === lastBarcode || isLoading) return;
      setLastBarcode(barcode);
      setIsLoading(true);
      setError(null);
      try {
        setItem(
          await apiRequest<FoodItem>(
            `/food/barcode/${encodeURIComponent(barcode)}`,
          ),
        );
      } catch (requestError) {
        setItem(null);
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to look up this barcode.',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, lastBarcode],
  );

  const reset = useCallback(() => {
    setItem(null);
    setError(null);
    setLastBarcode(null);
  }, []);

  return { item, isLoading, error, lookup, reset };
}
