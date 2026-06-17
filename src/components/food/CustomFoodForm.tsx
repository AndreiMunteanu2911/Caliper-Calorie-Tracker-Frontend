import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { PlusIcon, ScanIcon, SparkleIcon, XIcon } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/src/components/ui/Button';
import { InputBox } from '@/src/components/ui/InputBox';
import { ModalWrapper } from '@/src/components/ui/ModalWrapper';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
import { useCustomFoods } from '@/src/hooks/useCustomFoods';
import { apiRequest } from '@/src/lib/api-client';
import { isNativeCapacitor } from '@/src/lib/capacitor';
import type { FoodItem, NutritionLabelAnalysis } from '@/src/types/api';

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
  const [isScanningLabel, setIsScanningLabel] = useState(false);
  const [labelReview, setLabelReview] = useState<string | null>(null);
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
    setLabelReview(null);
  }, [initialFood, visible]);

  async function scanNutritionLabel() {
    if (!isNativeCapacitor()) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setError('Camera access is required to scan a nutrition label.');
        return;
      }
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.9,
      base64: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset.base64) {
      setError('The nutrition label photo could not be read.');
      return;
    }
    setIsScanningLabel(true);
    setError(null);
    setLabelReview(null);
    try {
      const analysis = await apiRequest<NutritionLabelAnalysis>(
        '/ai/analyze-nutrition-label',
        {
          method: 'POST',
          timeoutMs: 90_000,
          body: {
            image_base64: asset.base64,
            media_type: asset.mimeType ?? 'image/jpeg',
          },
        },
      );
      if (analysis.name) setName(analysis.name);
      if (analysis.brand) setBrand(analysis.brand);
      setCalories(String(analysis.calories));
      setProtein(String(analysis.protein));
      setCarbs(String(analysis.carbs));
      setFats(String(analysis.fats));
      setFiber(String(analysis.fiber));
      setSugar(String(analysis.sugar));
      setSodium(String(analysis.sodium_mg));
      setSaturatedFat(String(analysis.saturated_fat));
      setLabelReview(
        `${analysis.confidence_explanation} Values were normalized per 100g from a ${analysis.serving_size_g}g serving. Review every field before saving.`,
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to read this nutrition label.',
      );
    } finally {
      setIsScanningLabel(false);
    }
  }

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
                    <XIcon color="#101010" size={18} weight="bold" />
                  </Pressable>
                </View>
              </View>

              <View className="gap-4 px-2 pb-3 pt-4">
                {!initialFood ? (
                  <View className="gap-2">
                    <Button
                      icon={ScanIcon}
                      iconPosition="left"
                      label="Scan nutrition label"
                      loading={isScanningLabel}
                      variant="outline"
                      onPress={() => void scanNutritionLabel()}
                    />
                    <Text className="text-center text-xs leading-4 text-white/40">
                      OCR transcribes the label, then AI checks units and likely
                      digit errors. You must review the result before saving.
                    </Text>
                  </View>
                ) : null}

                {labelReview ? (
                  <View className="rounded-2xl border border-protein/30 bg-protein/10 p-3">
                    <Text className="text-sm font-semibold leading-5 text-protein">
                      {labelReview}
                    </Text>
                  </View>
                ) : null}

                <View className="gap-2">
                  <View className="flex-row items-center gap-2">
                    <SparkleIcon color="#FF5A16" size={16} weight="bold" />
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
                  icon={PlusIcon}
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
