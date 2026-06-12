import { useState } from 'react';

import { apiRequest } from '@/src/lib/api-client';
import type {
  FoodItem,
  MealLogCreate,
  MealLogItem,
  MealType,
} from '@/src/types/api';

export function useMealLogs() {
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createLog(mealType: MealType, quantityG: number) {
    if (!selectedFood) return null;
    setIsSaving(true);
    setError(null);
    try {
      const payload: MealLogCreate = {
        food: selectedFood,
        meal_type: mealType,
        quantity_g: quantityG,
      };
      const created = await apiRequest<MealLogItem>('/meal-logs', {
        method: 'POST',
        body: payload,
      });
      setSelectedFood(null);
      return created;
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'Unable to log food.',
      );
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  return {
    selectedFood,
    isSaving,
    error,
    selectFood: setSelectedFood,
    dismiss: () => {
      setSelectedFood(null);
      setError(null);
    },
    createLog,
  };
}
