import { useEffect, useMemo, useState } from 'react';

import type { FoodItem, MealType } from '@/src/types/api';

export function useQuickLogForm(food: FoodItem | null) {
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [weight, setWeight] = useState('100');

  useEffect(() => {
    if (food) {
      setWeight(String(Math.round(food.serving_size_g || 100)));
    }
  }, [food]);
  const quantityG = Number(weight);
  const isValid = Number.isFinite(quantityG) && quantityG > 0 && quantityG <= 10_000;
  const macros = useMemo(() => {
    const scale = isValid ? quantityG / 100 : 0;
    return {
      calories: (food?.calories ?? 0) * scale,
      protein: (food?.protein ?? 0) * scale,
      carbs: (food?.carbs ?? 0) * scale,
      fats: (food?.fats ?? 0) * scale,
    };
  }, [food, isValid, quantityG]);

  return {
    mealType,
    weight,
    quantityG,
    isValid,
    macros,
    setMealType,
    setWeight,
  };
}
