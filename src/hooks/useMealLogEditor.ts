import { useEffect, useState } from 'react';

import type { MealLogItem, MealType } from '@/src/types/api';

export function useMealLogEditor(log: MealLogItem) {
  const [isEditing, setIsEditing] = useState(false);
  const [weight, setWeight] = useState(String(Math.round(log.quantity_g)));
  const [mealType, setMealType] = useState<MealType>(log.meal_type);

  useEffect(() => {
    if (!isEditing) {
      setWeight(String(Math.round(log.quantity_g)));
      setMealType(log.meal_type);
    }
  }, [isEditing, log.meal_type, log.quantity_g]);

  const quantityG = Number(weight);
  return {
    isEditing,
    weight,
    mealType,
    quantityG,
    isValid:
      Number.isFinite(quantityG) && quantityG > 0 && quantityG <= 10_000,
    setWeight,
    setMealType,
    startEditing: () => setIsEditing(true),
    cancelEditing: () => setIsEditing(false),
    finishEditing: () => setIsEditing(false),
  };
}
