export type MacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export type DailyMacroProgress = {
  date: string;
  timezone: string;
  consumed: MacroTotals;
  targets: MacroTotals;
  remaining: MacroTotals;
};

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export type FoodItem = {
  external_id: string;
  source: string;
  name: string;
  brand: string | null;
  serving_size_g: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export type MealLogItem = {
  id: string;
  meal_type: MealType;
  food_name: string;
  quantity_g: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  logged_at: string;
};

export type DashboardData = {
  progress: DailyMacroProgress;
  logs: MealLogItem[];
};

export type MealLogCreate = {
  food: FoodItem;
  meal_type: MealType;
  quantity_g: number;
};

export type MealLogUpdate = {
  meal_type?: MealType;
  quantity_g?: number;
};

export type EstimatedFood = {
  name: string;
  estimated_weight_g: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export type PlateAnalysis = {
  foods: EstimatedFood[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  confidence_explanation: string;
};

export type ChatResponse = {
  message: string;
};
