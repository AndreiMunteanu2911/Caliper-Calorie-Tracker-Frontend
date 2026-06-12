import { Modal, Pressable, Text, TextInput, View } from 'react-native';

import { MealTypeSelector } from '@/src/components/food/MealTypeSelector';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { useQuickLogForm } from '@/src/hooks/useQuickLogForm';
import type { FoodItem, MealType } from '@/src/types/api';

type QuickLogModalProps = {
  food: FoodItem | null;
  error: string | null;
  isSaving: boolean;
  onDismiss: () => void;
  onSave: (mealType: MealType, quantityG: number) => Promise<void>;
};

export function QuickLogModal({
  food,
  error,
  isSaving,
  onDismiss,
  onSave,
}: QuickLogModalProps) {
  const form = useQuickLogForm(food);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onDismiss}
      presentationStyle="pageSheet"
      visible={food !== null}>
      <View className="flex-1 bg-canvas px-5 pb-10 pt-8">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-semibold uppercase tracking-widest text-lime">
            Quick log
          </Text>
          <Pressable accessibilityRole="button" onPress={onDismiss}>
            <Text className="text-base font-semibold text-muted">Cancel</Text>
          </Pressable>
        </View>
        <Text className="mt-3 text-3xl font-bold text-white">{food?.name}</Text>
        <Text className="mt-1 text-muted">{food?.brand || 'Nutrition per 100g'}</Text>

        <View className="mt-8 gap-3">
          <Text className="text-sm font-semibold text-white">Meal</Text>
          <MealTypeSelector value={form.mealType} onChange={form.setMealType} />
        </View>

        <View className="mt-7 gap-2">
          <Text className="text-sm font-semibold text-white">Weight in grams</Text>
          <TextInput
            accessibilityLabel="Food weight in grams"
            className="h-16 rounded-2xl bg-panel px-5 text-2xl font-bold text-white"
            keyboardType="decimal-pad"
            onChangeText={form.setWeight}
            selectTextOnFocus
            value={form.weight}
          />
        </View>

        <View className="my-7 flex-row justify-between rounded-3xl bg-panel p-5">
          <View>
            <Text className="text-xs text-muted">Calories</Text>
            <Text className="text-xl font-bold text-lime">
              {Math.round(form.macros.calories)}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-muted">Protein</Text>
            <Text className="text-xl font-bold text-white">
              {form.macros.protein.toFixed(1)}g
            </Text>
          </View>
          <View>
            <Text className="text-xs text-muted">Carbs</Text>
            <Text className="text-xl font-bold text-white">
              {form.macros.carbs.toFixed(1)}g
            </Text>
          </View>
          <View>
            <Text className="text-xs text-muted">Fats</Text>
            <Text className="text-xl font-bold text-white">
              {form.macros.fats.toFixed(1)}g
            </Text>
          </View>
        </View>
        {error ? <Text className="mb-3 text-red-300">{error}</Text> : null}
        <PrimaryButton
          label="Add to today"
          disabled={!form.isValid}
          loading={isSaving}
          onPress={() => void onSave(form.mealType, form.quantityG)}
        />
      </View>
    </Modal>
  );
}
