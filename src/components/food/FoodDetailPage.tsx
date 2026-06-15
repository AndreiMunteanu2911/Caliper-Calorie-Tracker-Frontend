import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, Scale, Utensils } from 'lucide-react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MacroDonut } from '@/src/components/food/MacroDonut';
import { MealTypeSelector } from '@/src/components/food/MealTypeSelector';
import { AppPage } from '@/src/components/layout/AppPage';
import { BackButton } from '@/src/components/ui/BackButton';
import { Button } from '@/src/components/ui/Button';
import { InputBox } from '@/src/components/ui/InputBox';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
import { apiRequest } from '@/src/lib/api-client';
import { localNoonIso } from '@/src/lib/dates';
import { MotionFade, MotionPop } from '@/src/lib/motion';
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
    fiber?: string;
    sugar?: string;
    sodium_mg?: string;
    saturated_fat?: string;
    external_id: string;
    source: string;
    serving_size_g?: string;
    log_id?: string;
    existing_weight?: string;
    existing_meal_type?: MealType;
    date?: string;
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
    fiber: Number(params.fiber ?? 0),
    sugar: Number(params.sugar ?? 0),
    sodium_mg: Number(params.sodium_mg ?? 0),
    saturated_fat: Number(params.saturated_fat ?? 0),
    is_favorite: false,
  };
  const isEditing = !!params.log_id;
  const [mealType, setMealType] = useState<MealType>(
    (params.existing_meal_type as MealType) || 'breakfast',
  );
  const [weight, setWeight] = useState(
    params.existing_weight ?? String(Math.round(food.serving_size_g || 100)),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quantity = Number(weight);
  const isValid = Number.isFinite(quantity) && quantity >= 1 && quantity <= 999_999;
  const scale = quantity / 100;
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
          body: {
            food,
            meal_type: mealType,
            quantity_g: quantity,
            ...(params.date ? { logged_at: localNoonIso(params.date) } : {}),
          },
        });
      }
      setSaved(true);
      setTimeout(() => router.replace('/diary'), 260);
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
        contentContainerClassName="pb-8 pt-3">
        <AppPage>
          <View className="mb-4 flex-row items-center justify-between">
            <BackButton onPress={() => router.back()} />
            <Text className="text-xs font-black uppercase tracking-widest text-white/45">
              {isEditing ? 'Edit diary item' : 'Food details'}
            </Text>
            <View className="h-10 w-10" />
          </View>

          <View className="overflow-hidden rounded-3xl border border-white/10 bg-[#1C1C1C] p-2.5 shadow-card">
            <View className="relative overflow-hidden rounded-3xl bg-accent p-4">
              <View className="absolute -right-8 -top-8 h-28 w-28 rounded-full border-8 border-white/20" />
              <View className="flex-row items-start justify-between gap-3">
                <View className="min-w-0 flex-1">
                  <Text className="text-xs font-black text-white/70">
                    Per 100g
                  </Text>
                  <Text className="mt-1 text-2xl font-black tracking-tighter text-white">
                    {food.name}
                  </Text>
                  {food.brand ? (
                    <Text className="mt-0.5 text-sm font-semibold text-white/75">{food.brand}</Text>
                  ) : null}
                </View>
                <View className="h-10 w-10 items-center justify-center rounded-full bg-white/55">
                  <Utensils color="#FFFFFF" size={18} strokeWidth={2.6} />
                </View>
              </View>

              <View className="mt-4 flex-row items-center gap-4">
                <MacroDonut
                  carbs={food.carbs}
                  fats={food.fats}
                  protein={food.protein}
                  size={110}
                />
                <View>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xs font-black text-white/75">Calories</Text>
                  </View>
                  <Text className="mt-1 text-3xl font-black tracking-tighter text-white">
                    {Math.round(food.calories)}
                  </Text>
                  <Text className="text-sm font-bold text-white/70">kcal</Text>
                </View>
              </View>
            </View>

            <View className="mt-2.5 flex-row gap-2">
              {MACROS.map((macro) => (
                <View
                  className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#292929] px-2.5 py-2.5"
                  key={macro.key}>
                  <View className={`mb-1.5 h-1.5 w-6 rounded-full ${macro.color}`} />
                  <Text className="text-xs font-bold text-white/45">{macro.label}</Text>
                  <Text className={`mt-0.5 text-base font-black ${macro.text}`}>
                    {food[macro.key].toFixed(1)}g
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mt-3.5 gap-4 rounded-3xl border border-white/10 bg-[#1C1C1C] p-4 shadow-card">
            <View className="gap-2">
              <View className="flex-row items-center gap-2">
                <Scale color="#FF5A16" size={15} strokeWidth={2.5} />
                <Text className="text-sm font-black text-white">Amount</Text>
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

            <View className="rounded-2xl bg-accent px-4 py-3.5">
              <Text className="text-xs font-black uppercase tracking-widest text-white/60">
                This portion
              </Text>
              <View className="mt-1.5 flex-row items-end justify-between gap-3">
                <Text className="text-2xl font-black text-white">
                  {Math.round(scaled.calories)} kcal
                </Text>
                <Text className="pb-1 text-right text-xs font-bold leading-5 text-white/70">
                  P {scaled.protein.toFixed(1)}g  C {scaled.carbs.toFixed(1)}g{'\n'}
                  F {scaled.fats.toFixed(1)}g
                </Text>
              </View>
            </View>

            <View className="gap-2.5">
              <Text className="text-sm font-black text-white">Log under</Text>
              <MealTypeSelector value={mealType} onChange={setMealType} dark />
            </View>

            {error ? (
              <View className="rounded-2xl bg-dangerSoft p-3.5">
                <Text className="font-semibold text-danger">{error}</Text>
              </View>
            ) : null}
            {saved ? (
              <MotionFade>
                <View className="flex-row items-center justify-center gap-2 rounded-xl border border-accent bg-brand p-3.5">
                  <MotionPop>
                    <Check color="#FF5A16" size={16} strokeWidth={3} />
                  </MotionPop>
                  <Text className="font-black text-accent">
                    {isEditing ? 'Diary item updated.' : 'Food logged.'}
                  </Text>
                </View>
              </MotionFade>
            ) : null}

            <Button
              disabled={!isValid}
              label={isEditing ? 'Update diary item' : 'Add to today'}
              loading={isSaving}
              onPress={() => void save()}
            />
          </View>
        </AppPage>
      </ScrollbarContainer>
    </View>
  );
}
