import { useRouter } from 'expo-router';
import { Plus, Sparkles, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/src/components/ui/Button';
import { InputBox } from '@/src/components/ui/InputBox';
import { ModalWrapper } from '@/src/components/ui/ModalWrapper';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
import { useCustomFoods } from '@/src/hooks/useCustomFoods';
import type { FoodItem } from '@/src/types/api';

type CustomFoodFormProps = {
  visible: boolean;
  onDismiss: () => void;
  initialFood?: FoodItem | null;
  onSaved?: () => void;
  date?: string;
};

export function CustomFoodForm({
  visible,
  onDismiss,
  initialFood = null,
  onSaved,
  date,
}: CustomFoodFormProps) {
  const router = useRouter();
  const { create, update } = useCustomFoods();
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [fiber, setFiber] = useState('');
  const [sugar, setSugar] = useState('');
  const [sodium, setSodium] = useState('');
  const [saturatedFat, setSaturatedFat] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requiredNutritionIsValid = [calories, protein, carbs, fats].every(
    (value) => {
      if (!value.trim()) return false;
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed >= 0;
    },
  );
  const optionalNutritionIsValid = [
    fiber,
    sugar,
    sodium,
    saturatedFat,
  ].every((value) => {
    if (!value.trim()) return true;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0;
  });
  const formIsValid =
    Boolean(name.trim()) &&
    requiredNutritionIsValid &&
    optionalNutritionIsValid;

  useEffect(() => {
    if (!visible) return;
    setName(initialFood?.name ?? '');
    setBrand(initialFood?.brand ?? '');
    setCalories(initialFood ? String(initialFood.calories) : '');
    setProtein(initialFood ? String(initialFood.protein) : '');
    setCarbs(initialFood ? String(initialFood.carbs) : '');
    setFats(initialFood ? String(initialFood.fats) : '');
    setFiber(initialFood ? String(initialFood.fiber) : '');
    setSugar(initialFood ? String(initialFood.sugar) : '');
    setSodium(initialFood ? String(initialFood.sodium_mg) : '');
    setSaturatedFat(initialFood ? String(initialFood.saturated_fat) : '');
    setError(null);
  }, [initialFood, visible]);

  async function save() {
    if (!formIsValid) return;
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        brand: brand.trim() || null,
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fats: Number(fats) || 0,
        fiber: Number(fiber) || 0,
        sugar: Number(sugar) || 0,
        sodium_mg: Number(sodium) || 0,
        saturated_fat: Number(saturatedFat) || 0,
      };
      const created = initialFood
        ? await update(initialFood.external_id, payload)
        : await create(payload);
      setName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFats('');
      setFiber('');
      setSugar('');
      setSodium('');
      setSaturatedFat('');
      onDismiss();
      onSaved?.();
      if (initialFood) return;
      router.push({
        pathname: '/food-detail',
        params: {
          external_id: created.external_id,
          source: created.source,
          name: created.name,
          brand: created.brand ?? '',
          calories: String(created.calories),
          protein: String(created.protein),
          carbs: String(created.carbs),
          fats: String(created.fats),
          fiber: String(created.fiber),
          sugar: String(created.sugar),
          sodium_mg: String(created.sodium_mg),
          saturated_fat: String(created.saturated_fat),
          serving_size_g: String(created.serving_size_g),
          date,
        },
      });
    } catch {
      setError('Unable to save custom food.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ModalWrapper isOpen={visible} onClose={onDismiss}>
      <ScrollbarContainer
        contentContainerClassName="p-3"
        keyboardShouldPersistTaps="handled">
              <View className="relative overflow-hidden rounded-3xl bg-carbs p-4">
                <View className="absolute -right-8 -top-10 h-24 w-24 rounded-full border-8 border-white/25" />
                <View className="flex-row items-start justify-between">
                  <View className="min-w-0 flex-1 pr-4">
                    <Text className="text-xs font-black uppercase tracking-widest text-brand/50">
                      Your food library
                    </Text>
                    <Text className="mt-1 text-2xl font-black tracking-tighter text-brand">
                      {initialFood ? 'Edit custom food' : 'Create custom food'}
                    </Text>
                    <Text className="mt-1.5 text-sm leading-5 text-brand/60">
                      Enter nutrition per 100g. Values can be updated later.
                    </Text>
                  </View>
                  <Pressable
                    accessibilityLabel="Close custom food"
                    className="h-10 w-10 items-center justify-center rounded-full bg-white/60"
                    onPress={onDismiss}>
                    <X color="#101010" size={18} strokeWidth={2.7} />
                  </Pressable>
                </View>
              </View>

              <View className="gap-4 px-2 pb-3 pt-4">
                <View className="gap-2">
                  <View className="flex-row items-center gap-2">
                    <Sparkles color="#FF5A16" size={16} />
                    <Text className="font-black text-white">Food name *</Text>
                  </View>
                  <InputBox
                    compact
                    onChangeText={setName}
                    placeholder="Chicken breast"
                    value={name}
                  />
                  <InputBox
                    compact
                    onChangeText={setBrand}
                    placeholder="Brand (optional)"
                    value={brand}
                  />
                </View>

                <View className="gap-3">
                  <Text className="font-black text-white">
                    Required nutrition per 100g
                  </Text>
                  <View className="flex-row gap-3">
                    <View className="min-w-0 flex-1 gap-1.5">
                      <Text className="text-xs font-bold text-white/40">
                        Calories *
                      </Text>
                      <InputBox compact keyboardType="decimal-pad" onChangeText={setCalories} placeholder="kcal" value={calories} />
                    </View>
                    <View className="min-w-0 flex-1 gap-1.5">
                      <Text className="text-xs font-bold text-protein">
                        Protein *
                      </Text>
                      <InputBox compact keyboardType="decimal-pad" onChangeText={setProtein} placeholder="grams" value={protein} />
                    </View>
                  </View>
                  <View className="flex-row gap-3">
                    <View className="min-w-0 flex-1 gap-1.5">
                      <Text className="text-xs font-bold text-carbs">
                        Carbs *
                      </Text>
                      <InputBox compact keyboardType="decimal-pad" onChangeText={setCarbs} placeholder="grams" value={carbs} />
                    </View>
                    <View className="min-w-0 flex-1 gap-1.5">
                      <Text className="text-xs font-bold text-fats">
                        Fat *
                      </Text>
                      <InputBox compact keyboardType="decimal-pad" onChangeText={setFats} placeholder="grams" value={fats} />
                    </View>
                  </View>
                </View>

                <View className="gap-3">
                  <Text className="font-black text-white">
                    Optional nutrients per 100g
                  </Text>
                  <View className="flex-row gap-3">
                    <View className="min-w-0 flex-1">
                      <InputBox compact keyboardType="decimal-pad" onChangeText={setFiber} placeholder="Fiber g" value={fiber} />
                    </View>
                    <View className="min-w-0 flex-1">
                      <InputBox compact keyboardType="decimal-pad" onChangeText={setSugar} placeholder="Sugar g" value={sugar} />
                    </View>
                  </View>
                  <View className="flex-row gap-3">
                    <View className="min-w-0 flex-1">
                      <InputBox compact keyboardType="decimal-pad" onChangeText={setSodium} placeholder="Sodium mg" value={sodium} />
                    </View>
                    <View className="min-w-0 flex-1">
                      <InputBox compact keyboardType="decimal-pad" onChangeText={setSaturatedFat} placeholder="Saturated fat g" value={saturatedFat} />
                    </View>
                  </View>
                </View>

                {error ? (
                  <View className="rounded-2xl bg-dangerSoft p-4">
                    <Text className="font-semibold text-danger">{error}</Text>
                  </View>
                ) : null}

                <Button
                  disabled={!formIsValid}
                  icon={Plus}
                  iconPosition="left"
                  label={initialFood ? 'Save changes' : 'Create and continue'}
                  loading={isSaving}
                  onPress={() => void save()}
                />
              </View>
      </ScrollbarContainer>
    </ModalWrapper>
  );
}
