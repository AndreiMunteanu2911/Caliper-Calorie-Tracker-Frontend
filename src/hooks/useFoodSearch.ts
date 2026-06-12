import { useEffect, useState } from 'react';

import { apiRequest } from '@/src/lib/api-client';
import type { FoodItem } from '@/src/types/api';

type FoodSearchResponse = {
  items: FoodItem[];
};

export function useFoodSearch(query: string) {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 2) {
      setItems([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setIsLoading(true);
      setError(null);
      void apiRequest<FoodSearchResponse>(
        `/food/search?query=${encodeURIComponent(normalized)}`,
        { signal: controller.signal },
      )
        .then((response) => setItems(response.items))
        .catch((requestError: unknown) => {
          if (requestError instanceof Error && requestError.name === 'AbortError') return;
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Unable to search foods.',
          );
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsLoading(false);
        });
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { items, isLoading, error };
}
