import { Check, Flame, X } from 'lucide-react-native';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';

import { MealTypeSelector } from '@/src/components/food/MealTypeSelector';
import { AnimatedPresence } from '@/src/components/ui/AnimatedPresence';
import { Button } from '@/src/components/ui/Button';
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
          <Text className="text-sm font-black uppercase tracking-[2px] text-accent">
            Quick log
          </Text>
          <Pressable
            accessibilityLabel="Close quick log"
            accessibilityRole="button"
            className="h-11 w-11 items-center justify-center rounded-2xl bg-raised"
            onPress={onDismiss}>
            <X color="#101010" size={20} strokeWidth={2.6} />
          </Pressable>
        </View>
        <Text className="mt-3 text-3xl font-black text-ink">{food?.name}</Text>
        <Text className="mt-1 text-muted">{food?.brand || 'Nutrition per 100g'}</Text>

        <View className="mt-8 gap-3">
          <Text className="text-sm font-black text-ink">Meal</Text>
          <MealTypeSelector value={form.mealType} onChange={form.setMealType} />
        </View>

        <View className="mt-7 gap-2">
          <Text className="text-sm font-black text-ink">Weight in grams</Text>
          <TextInput
            accessibilityLabel="Food weight in grams"
            className="h-16 rounded-2xl border border-line bg-surface px-5 text-2xl font-black text-ink"
            keyboardType="decimal-pad"
            onChangeText={form.setWeight}
            selectTextOnFocus
            value={form.weight}
          />
        </View>

        <View className="my-7 flex-row flex-wrap justify-between gap-4 rounded-[28px] bg-fatsSoft p-5 shadow-soft">
          <View>
            <View className="flex-row items-center gap-1">
              <Flame color="#FF5A2F" size={14} strokeWidth={2.5} />
              <Text className="text-xs text-muted">Calories</Text>
            </View>
            <Text className="text-xl font-black text-brand">
              {Math.round(form.macros.calories)}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-muted">Protein</Text>
            <Text className="text-xl font-black text-ink">
              {form.macros.protein.toFixed(1)}g
            </Text>
          </View>
          <View>
            <Text className="text-xs text-muted">Carbs</Text>
            <Text className="text-xl font-black text-ink">
              {form.macros.carbs.toFixed(1)}g
            </Text>
          </View>
          <View>
            <Text className="text-xs text-muted">Fats</Text>
            <Text className="text-xl font-black text-ink">
              {form.macros.fats.toFixed(1)}g
            </Text>
          </View>
        </View>
        {error ? (
          <AnimatedPresence className="mb-3 rounded-2xl bg-dangerSoft p-3">
            <Text className="font-semibold text-danger">{error}</Text>
          </AnimatedPresence>
        ) : null}
        <Button
          label="Add to today"
          icon={Check}
          disabled={!form.isValid}
          loading={isSaving}
          onPress={() => void onSave(form.mealType, form.quantityG)}
        />
      </View>
    </Modal>
  );
}
