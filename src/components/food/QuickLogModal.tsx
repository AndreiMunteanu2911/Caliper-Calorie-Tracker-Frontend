import { Check, Flame, X } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { MealTypeSelector } from '@/src/components/food/MealTypeSelector';
import { AnimatedPresence } from '@/src/components/ui/AnimatedPresence';
import { Button } from '@/src/components/ui/Button';
import { InputBox } from '@/src/components/ui/InputBox';
import { ModalWrapper } from '@/src/components/ui/ModalWrapper';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
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
    <ModalWrapper
      isOpen={food !== null}
      onClose={onDismiss}
      position="bottom">
      <ScrollbarContainer
        contentContainerClassName="bg-canvas px-5 pb-8 pt-6"
        keyboardShouldPersistTaps="handled">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-black uppercase tracking-widest text-accent">
            Quick log
          </Text>
          <Pressable
            accessibilityLabel="Close quick log"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-2xl bg-raised"
            onPress={onDismiss}>
            <X color="#101010" size={18} strokeWidth={2.6} />
          </Pressable>
        </View>
        <Text className="mt-2 text-2xl font-black text-ink">{food?.name}</Text>
        <Text className="mt-0.5 text-sm text-muted">{food?.brand || 'Nutrition per 100g'}</Text>

        <View className="mt-6 gap-2.5">
          <Text className="text-sm font-black text-ink">Meal</Text>
          <MealTypeSelector value={form.mealType} onChange={form.setMealType} />
        </View>

        <View className="mt-5 gap-1.5">
          <Text className="text-sm font-black text-ink">Weight in grams</Text>
          <InputBox
            keyboardType="decimal-pad"
            onChangeText={form.setWeight}
            selectTextOnFocus
            value={form.weight}
          />
        </View>

        <View className="my-5 flex-row flex-wrap justify-between gap-3 rounded-3xl bg-fatsSoft p-4 shadow-soft">
          <View>
            <View className="flex-row items-center gap-1">
              <Flame color="#FF5A16" size={12} strokeWidth={2.5} />
              <Text className="text-xs text-muted">Calories</Text>
            </View>
            <Text className="text-lg font-black text-brand">
              {Math.round(form.macros.calories)}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-muted">Protein</Text>
            <Text className="text-lg font-black text-ink">
              {form.macros.protein.toFixed(1)}g
            </Text>
          </View>
          <View>
            <Text className="text-xs text-muted">Carbs</Text>
            <Text className="text-lg font-black text-ink">
              {form.macros.carbs.toFixed(1)}g
            </Text>
          </View>
          <View>
            <Text className="text-xs text-muted">Fats</Text>
            <Text className="text-lg font-black text-ink">
              {form.macros.fats.toFixed(1)}g
            </Text>
          </View>
        </View>
        {error ? (
          <AnimatedPresence className="mb-3 rounded-2xl bg-dangerSoft p-2.5">
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
      </ScrollbarContainer>
    </ModalWrapper>
  );
}
