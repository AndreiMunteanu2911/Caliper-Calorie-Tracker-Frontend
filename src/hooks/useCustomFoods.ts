import { useCallback, useState } from 'react';

import { apiRequest } from '@/src/lib/api-client';
import type { FoodItem } from '@/src/types/api';

export type CustomFoodInput = {
  name: string;
  brand?: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium_mg: number;
  saturated_fat: number;
};

export function useCustomFoods() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setItems(await apiRequest<FoodItem[]>('/custom-foods'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const create = useCallback(async (food: CustomFoodInput) => {
    const created = await apiRequest<FoodItem>('/custom-foods', {
      method: 'POST',
      body: food,
    });
    setItems((current) => [created, ...current]);
    return created;
  }, []);

  const update = useCallback(
    async (
      id: string,
      food: Partial<CustomFoodInput> & { is_favorite?: boolean },
    ) => {
      const updated = await apiRequest<FoodItem>(`/custom-foods/${id}`, {
        method: 'PATCH',
        body: food,
      });
      setItems((current) =>
        current
          .map((item) => (item.external_id === id ? updated : item))
          .sort(
            (left, right) =>
              Number(right.is_favorite) - Number(left.is_favorite),
          ),
      );
      return updated;
    },
    [],
  );

  const remove = useCallback(async (id: string) => {
    await apiRequest(`/custom-foods/${id}`, { method: 'DELETE' });
    setItems((current) =>
      current.filter((item) => item.external_id !== id),
    );
  }, []);

  return { items, isLoading, load, create, update, remove };
}
