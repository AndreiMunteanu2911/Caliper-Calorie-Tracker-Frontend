import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Flame, Scale, Utensils } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MacroDonut } from '@/src/components/food/MacroDonut';
import { MealTypeSelector } from '@/src/components/food/MealTypeSelector';
import { Button } from '@/src/components/ui/Button';
import { InputBox } from '@/src/components/ui/InputBox';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
import { apiRequest } from '@/src/lib/api-client';
import type { FoodItem, MealLogItem, MealType } from '@/src/types/api';

const MACROS = [
  { key: 'protein', label: 'Protein', color: 'bg-protein', text: 'text-protein' },
  { key: 'carbs', label: 'Carbs', color: 'bg-carbs', text: 'text-carbs' },
  { key: 'fats', label: 'Fat', color: 'bg-fats', text: 'text-fats' },
] as const;

export function FoodDetailPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    name: string;
    brand?: string;
    calories: string;
    protein: string;
    carbs: string;
    fats: string;
    external_id: string;
    source: string;
    serving_size_g?: string;
    log_id?: string;
    existing_weight?: string;
    existing_meal_type?: MealType;
  }>();

  const food: FoodItem = {
    external_id: params.external_id,
    source: params.source,
    name: params.name,
    brand: params.brand || null,
    serving_size_g: Number(params.serving_size_g ?? 100),
    calories: Number(params.calories),
    protein: Number(params.protein),
    carbs: Number(params.carbs),
    fats: Number(params.fats),
  };
  const isEditing = !!params.log_id;
  const [mealType, setMealType] = useState<MealType>(
    (params.existing_meal_type as MealType) || 'breakfast',
  );
  const [weight, setWeight] = useState(
    params.existing_weight ?? String(Math.round(food.serving_size_g || 100)),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quantity = Number(weight);
  const isValid = Number.isFinite(quantity) && quantity >= 1 && quantity <= 10_000;
  const scale = isValid ? quantity / 100 : 0;
  const scaled = {
    calories: food.calories * scale,
    protein: food.protein * scale,
    carbs: food.carbs * scale,
    fats: food.fats * scale,
  };

  async function save() {
    if (!isValid) return;
    setIsSaving(true);
    setError(null);
    try {
      if (isEditing) {
        await apiRequest<MealLogItem>(`/meal-logs/${params.log_id}`, {
          method: 'PATCH',
          body: { quantity_g: quantity, meal_type: mealType },
        });
      } else {
        await apiRequest<MealLogItem>('/meal-logs', {
          method: 'POST',
          body: { food, meal_type: mealType, quantity_g: quantity },
        });
      }
      router.back();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to save food.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View className="flex-1 bg-brand" style={{ paddingTop: insets.top }}>
      <ScrollbarContainer
        className="flex-1"
        contentContainerClassName="px-4 pb-32 pt-4 sm:px-6">
        <View className="w-full max-w-lg self-center">
          <View className="mb-5 flex-row items-center justify-between">
            <Pressable
              accessibilityLabel="Go back"
              className="h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#232323]"
              onPress={() => router.back()}>
              <ChevronLeft color="#FFFFFF" size={22} />
            </Pressable>
            <Text className="text-sm font-black uppercase tracking-[1.5px] text-white/45">
              {isEditing ? 'Edit diary item' : 'Food details'}
            </Text>
            <View className="h-11 w-11" />
          </View>

          <View className="overflow-hidden rounded-[32px] border border-white/10 bg-[#1C1C1C] p-3 shadow-card">
            <View className="relative overflow-hidden rounded-[26px] bg-accent p-5">
              <View className="absolute -right-9 -top-10 h-32 w-32 rounded-full border-[22px] border-white/20" />
              <View className="flex-row items-start justify-between gap-4">
                <View className="min-w-0 flex-1">
                  <Text className="text-xs font-black text-white/70">
                    Per 100g
                  </Text>
                  <Text className="mt-2 text-3xl font-black tracking-[-1.2px] text-white">
                    {food.name}
                  </Text>
                  {food.brand ? (
                    <Text className="mt-1 font-semibold text-white/75">{food.brand}</Text>
                  ) : null}
                </View>
                <View className="h-12 w-12 items-center justify-center rounded-full bg-white/55">
                  <Utensils color="#FFFFFF" size={21} strokeWidth={2.6} />
                </View>
              </View>

              <View className="mt-6 flex-row items-center gap-5">
                <MacroDonut
                  carbs={food.carbs}
                  fats={food.fats}
                  protein={food.protein}
                  size={126}
                />
                <View>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-sm font-black text-white/75">Calories</Text>
                  </View>
                  <Text className="mt-1 text-4xl font-black tracking-[-2px] text-white">
                    {Math.round(food.calories)}
                  </Text>
                  <Text className="font-bold text-white/70">kcal</Text>
                </View>
              </View>
            </View>

            <View className="mt-3 flex-row gap-2">
              {MACROS.map((macro) => (
                <View
                  className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#292929] px-3 py-3"
                  key={macro.key}>
                  <View className={`mb-2 h-2 w-8 rounded-full ${macro.color}`} />
                  <Text className="text-xs font-bold text-white/45">{macro.label}</Text>
                  <Text className={`mt-1 text-lg font-black ${macro.text}`}>
                    {food[macro.key].toFixed(1)}g
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mt-4 gap-5 rounded-[28px] border border-white/10 bg-[#1C1C1C] p-5 shadow-card">
            <View className="gap-2">
              <View className="flex-row items-center gap-2">
                <Scale color="#FF5A16" size={17} strokeWidth={2.5} />
                <Text className="font-black text-white">Amount</Text>
              </View>
              <InputBox
                compact
                keyboardType="decimal-pad"
                onChangeText={setWeight}
                placeholder="100"
                selectTextOnFocus
                value={weight}
              />
              <Text className="text-xs font-semibold text-white/35">
                Enter the portion weight in grams.
              </Text>
            </View>

            <View className="rounded-[22px] bg-accent px-5 py-4">
              <Text className="text-xs font-black uppercase tracking-[1.2px] text-white/60">
                This portion
              </Text>
              <View className="mt-2 flex-row items-end justify-between gap-3">
                <Text className="text-3xl font-black text-white">
                  {Math.round(scaled.calories)} kcal
                </Text>
                <Text className="pb-1 text-right text-xs font-bold leading-5 text-white/70">
                  P {scaled.protein.toFixed(1)}g  C {scaled.carbs.toFixed(1)}g{'\n'}
                  F {scaled.fats.toFixed(1)}g
                </Text>
              </View>
            </View>

            <View className="gap-3">
              <Text className="font-black text-white">Log under</Text>
              <MealTypeSelector value={mealType} onChange={setMealType} dark />
            </View>

            {error ? (
              <View className="rounded-2xl bg-dangerSoft p-4">
                <Text className="font-semibold text-danger">{error}</Text>
              </View>
            ) : null}

            <Button
              disabled={!isValid}
              label={isEditing ? 'Update diary item' : 'Add to today'}
              loading={isSaving}
              onPress={() => void save()}
            />
          </View>
        </View>
      </ScrollbarContainer>
    </View>
  );
}
