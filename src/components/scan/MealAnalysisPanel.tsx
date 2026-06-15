import { Camera, ImagePlus, Sparkles, Trash2 } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { MealTypeSelector } from '@/src/components/food/MealTypeSelector';
import { Button } from '@/src/components/ui/Button';
import { InputBox } from '@/src/components/ui/InputBox';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { useMealAnalysis } from '@/src/hooks/useMealAnalysis';
import { apiRequest } from '@/src/lib/api-client';
import { localNoonIso } from '@/src/lib/dates';
import { motion } from '@/src/lib/motion';
import type {
  EstimatedFood,
  FoodItem,
  MealLogCreate,
  MealLogItem,
  MealType,
} from '@/src/types/api';

type DraftFood = EstimatedFood & {
  id: string;
  quantity: string;
};

export function MealAnalysisPanel() {
  const analysis = useMealAnalysis();
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date?: string }>();
  const [foods, setFoods] = useState<DraftFood[]>([]);
  const [mealType, setMealType] = useState<MealType>('dinner');
  const [isLogging, setIsLogging] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);

  useEffect(() => {
    setFoods(
      (analysis.analysis?.foods ?? []).map((food, index) => ({
        ...food,
        id: `${index}-${food.name}`,
        quantity: String(Math.round(food.estimated_weight_g)),
      })),
    );
  }, [analysis.analysis]);

  function updateQuantity(id: string, quantity: string) {
    setFoods((current) =>
      current.map((food) => (food.id === id ? { ...food, quantity } : food)),
    );
  }

  function removeFood(id: string) {
    setFoods((current) => current.filter((food) => food.id !== id));
  }

  async function logMeal() {
    const validFoods = foods.filter((food) => Number(food.quantity) > 0);
    if (validFoods.length === 0) return;
    setIsLogging(true);
    setLogError(null);
    try {
      const items: MealLogCreate[] = validFoods.map((food, index) => {
        const estimatedWeight = Math.max(food.estimated_weight_g, 1);
        const per100 = (value: number) => (value / estimatedWeight) * 100;
        const item: FoodItem = {
          external_id: `analysis-${Date.now()}-${index}`,
          source: 'ai_analysis',
          name: food.name,
          brand: null,
          serving_size_g: estimatedWeight,
          calories: per100(food.calories),
          protein: per100(food.protein),
          carbs: per100(food.carbs),
          fats: per100(food.fats),
          fiber: per100(food.fiber ?? 0),
          sugar: per100(food.sugar ?? 0),
          sodium_mg: per100(food.sodium_mg ?? 0),
          saturated_fat: per100(food.saturated_fat ?? 0),
          is_favorite: false,
        };
        return {
          food: item,
          meal_type: mealType,
          quantity_g: Number(food.quantity),
          ...(date ? { logged_at: localNoonIso(date) } : {}),
        };
      });
      await apiRequest<MealLogItem[]>('/meal-logs/bulk', {
        method: 'POST',
        body: { items },
      });
      analysis.setAnalysis(null);
      router.replace('/diary');
    } catch (requestError) {
      setLogError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to log this meal.',
      );
    } finally {
      setIsLogging(false);
    }
  }

  return (
    <View className="gap-4">
      <View className="rounded-3xl border border-white/10 bg-[#242424] p-4 shadow-soft">
        <View className="mb-3 h-10 w-10 items-center justify-center rounded-2xl bg-fats">
          <Sparkles color="#101010" size={19} strokeWidth={2.6} />
        </View>
        <Text className="text-xl font-black tracking-tight text-white">Analyze a meal</Text>
        <Text className="mt-1.5 text-sm leading-5 text-white/55">
          Photograph your meal, then review every portion before logging it.
        </Text>
      </View>
      <InputBox
        compact
        onChangeText={analysis.setContext}
        placeholder="Optional context: chicken, rice, sauce..."
        value={analysis.context}
      />
      <View className="gap-3">
        <Button
          label="Take photo"
          icon={Camera}
          iconPosition="left"
          disabled={analysis.isAnalyzing || isLogging}
          onPress={() => router.push('/meal-camera')}
        />
        <Button
          label="Choose from library"
          icon={ImagePlus}
          iconPosition="left"
          variant="outline"
          disabled={analysis.isAnalyzing || isLogging}
          onPress={() => void analysis.choosePhoto()}
        />
      </View>
      {analysis.error ? (
        <Animated.View
          className="rounded-2xl bg-dangerSoft p-4"
          entering={motion.enter}
          exiting={motion.exit}
          layout={motion.layout}>
          <Text className="font-semibold text-danger">{analysis.error}</Text>
        </Animated.View>
      ) : null}
      {analysis.isAnalyzing ? (
        <Animated.View
          className="items-center rounded-3xl border border-white/10 bg-[#242424] px-6 py-10 shadow-card"
          entering={motion.enter}
          exiting={motion.exit}
          layout={motion.layout}>
          <LoadingSpinner size="large" />
          <Text className="mt-3 text-center text-base font-black text-white">
            Analyzing your meal
          </Text>
          <Text className="mt-1.5 text-center text-sm leading-5 text-white/45">
            Estimating foods, portions, macros, and micronutrients...
          </Text>
        </Animated.View>
      ) : null}
      {analysis.analysis ? (
        <Animated.View
          className="gap-4 rounded-3xl border border-white/10 bg-[#242424] p-4 shadow-card"
          entering={motion.enter}
          exiting={motion.exit}
          layout={motion.layout}>
          <View>
            <Text className="text-xl font-black text-white">
              Review detected foods
            </Text>
            <Text className="mt-1 text-sm leading-5 text-white/50">
              AI estimates are approximate. Adjust portions or remove incorrect
              items before saving.
            </Text>
          </View>

          <MealTypeSelector value={mealType} onChange={setMealType} dark />

          {foods.map((food) => {
            const ratio =
              Number(food.quantity) > 0 && food.estimated_weight_g > 0
                ? Number(food.quantity) / food.estimated_weight_g
                : 0;
            return (
              <View
                className="rounded-2xl border border-white/10 bg-[#181818] p-3"
                key={food.id}>
                <View className="flex-row items-start gap-3">
                  <View className="min-w-0 flex-1">
                    <Text className="font-black text-white">{food.name}</Text>
                    <Text className="mt-1 text-xs text-white/45">
                      {Math.round(food.calories * ratio)} kcal · P{' '}
                      {(food.protein * ratio).toFixed(1)}g · C{' '}
                      {(food.carbs * ratio).toFixed(1)}g · F{' '}
                      {(food.fats * ratio).toFixed(1)}g
                    </Text>
                  </View>
                  <Pressable
                    accessibilityLabel={`Remove ${food.name}`}
                    className="h-9 w-9 items-center justify-center rounded-xl bg-white/5"
                    onPress={() => removeFood(food.id)}>
                    <Trash2 color="#C64035" size={16} />
                  </Pressable>
                </View>
                <View className="mt-3 flex-row items-center gap-2">
                  <View className="min-w-0 flex-1">
                    <InputBox
                      compact
                      keyboardType="decimal-pad"
                      value={food.quantity}
                      onChangeText={(value) => updateQuantity(food.id, value)}
                    />
                  </View>
                  <Text className="font-bold text-white/45">grams</Text>
                </View>
              </View>
            );
          })}

          <Text className="text-sm leading-5 text-white/55">
            {analysis.analysis.confidence_explanation}
          </Text>
          {logError ? (
            <View className="rounded-2xl bg-dangerSoft p-3">
              <Text className="font-semibold text-danger">{logError}</Text>
            </View>
          ) : null}
          <Button
            label={`Log meal (${foods.length} items)`}
            loading={isLogging}
            disabled={
              foods.length === 0 ||
              foods.some((food) => !(Number(food.quantity) > 0))
            }
            onPress={() => void logMeal()}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}
