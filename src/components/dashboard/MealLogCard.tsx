import { Pencil, Trash2, Utensils } from 'lucide-react-native';
import { Pressable, Text, TextInput, View } from 'react-native';

import { MealTypeSelector } from '@/src/components/food/MealTypeSelector';
import { AnimatedPresence } from '@/src/components/ui/AnimatedPresence';
import { Button } from '@/src/components/ui/Button';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { useMealLogEditor } from '@/src/hooks/useMealLogEditor';
import type { MealLogItem, MealLogUpdate } from '@/src/types/api';

type MealLogCardProps = {
  log: MealLogItem;
  isMutating: boolean;
  onUpdate: (log: MealLogItem, update: MealLogUpdate) => Promise<boolean>;
  onDelete: (log: MealLogItem) => Promise<void>;
};

export function MealLogCard({
  log,
  isMutating,
  onUpdate,
  onDelete,
}: MealLogCardProps) {
  const editor = useMealLogEditor(log);

  async function save() {
    if (!editor.isValid) return;
    const updated = await onUpdate(log, {
      quantity_g: editor.quantityG,
      meal_type: editor.mealType,
    });
    if (updated) editor.finishEditing();
  }

  if (editor.isEditing) {
    return (
      <AnimatedPresence className="gap-4 rounded-2xl border border-line bg-white p-4 shadow-soft">
        <Text className="text-lg font-black text-ink">{log.food_name}</Text>
        <MealTypeSelector
          value={editor.mealType}
          onChange={editor.setMealType}
        />
        <TextInput
          accessibilityLabel={`Weight for ${log.food_name}`}
          className="h-12 rounded-xl border border-line bg-raised px-4 text-lg text-ink"
          keyboardType="decimal-pad"
          onChangeText={editor.setWeight}
          value={editor.weight}
        />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button
              label="Cancel"
              size="compact"
              variant="secondary"
              disabled={isMutating}
              onPress={editor.cancelEditing}
            />
          </View>
          <View className="flex-1">
            <Button
              label="Save"
              size="compact"
              disabled={!editor.isValid}
              loading={isMutating}
              onPress={() => void save()}
            />
          </View>
        </View>
      </AnimatedPresence>
    );
  }

  return (
    <AnimatedPresence className="flex-row items-center gap-3 rounded-[22px] border border-line bg-white p-4 shadow-soft">
      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-carbs">
        <Utensils color="#101010" size={20} strokeWidth={2.5} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-black text-ink">{log.food_name}</Text>
        <Text className="mt-1 text-sm text-muted">
          {Math.round(log.quantity_g)}g  |  {Math.round(log.calories)} kcal  |  P{' '}
          {log.protein.toFixed(1)}g
        </Text>
      </View>
      {isMutating ? (
        <LoadingSpinner />
      ) : (
        <View className="flex-row items-center gap-2">
          <Pressable
            accessibilityLabel={`Edit ${log.food_name}`}
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-xl bg-raised"
            onPress={editor.startEditing}
          >
            <Pencil color="#101010" size={17} strokeWidth={2.4} />
          </Pressable>
          <Pressable
            accessibilityLabel={`Delete ${log.food_name}`}
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-xl bg-dangerSoft"
            onPress={() => void onDelete(log)}>
            <Trash2 color="#C64035" size={17} strokeWidth={2.4} />
          </Pressable>
        </View>
      )}
    </AnimatedPresence>
  );
}
