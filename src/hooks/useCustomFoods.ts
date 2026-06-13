import { useCallback, useState } from 'react';

import { apiRequest } from '@/src/lib/api-client';
import type { FoodItem } from '@/src/types/api';

export function useCustomFoods() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setItems(await apiRequest<FoodItem[]>('/custom-foods'));
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  const create = useCallback(
    async (food: { name: string; calories: number; protein: number; carbs: number; fats: number }) => {
      const created = await apiRequest<FoodItem>('/custom-foods', {
        method: 'POST',
        body: food,
      });
      setItems((prev) => [created, ...prev]);
      return created;
    },
    [],
  );

  const remove = useCallback(async (id: string) => {
    await apiRequest(`/custom-foods/${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((item) => item.external_id !== id));
  }, []);

  return { items, isLoading, load, create, remove };
}
