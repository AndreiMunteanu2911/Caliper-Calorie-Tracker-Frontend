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

export type MealAnalysis = {
  foods: EstimatedFood[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  confidence_explanation: string;
};

export type AdvisorMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

export type AdvisorConversation = {
  id: string;
  messages: AdvisorMessage[];
};

export type ChatResponse = {
  conversation_id: string;
  user_message: AdvisorMessage;
  assistant_message: AdvisorMessage;
};

export type Profile = {
  display_name: string | null;
  email: string;
  daily_calorie_target: number;
  daily_protein_target: number;
  daily_carbs_target: number;
  daily_fats_target: number;
  protein_percentage: number;
  carbs_percentage: number;
  fats_percentage: number;
};

export type ProfileUpdate = {
  display_name: string;
  daily_calorie_target: number;
  target_mode: 'grams' | 'percentages';
  protein: number;
  carbs: number;
  fats: number;
};
