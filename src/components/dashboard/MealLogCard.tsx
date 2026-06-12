import { Text, TextInput, View } from 'react-native';

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
      <AnimatedPresence className="gap-4 rounded-3xl border border-brand/20 bg-surface p-4">
        <Text className="text-lg font-black text-ink">{log.food_name}</Text>
        <MealTypeSelector value={editor.mealType} onChange={editor.setMealType} />
        <TextInput
          accessibilityLabel={`Weight for ${log.food_name}`}
          className="h-12 rounded-xl border border-line bg-canvas px-4 text-lg text-ink"
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
    <AnimatedPresence className="flex-row items-center gap-3 rounded-3xl border border-line bg-surface p-4">
      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-accentSoft">
        <Text className="text-lg font-black text-brand">
          {log.food_name.slice(0, 1).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-black text-ink">{log.food_name}</Text>
        <Text className="mt-1 text-sm text-muted">
          {Math.round(log.quantity_g)}g / {Math.round(log.calories)} kcal / P{' '}
          {log.protein.toFixed(1)}g
        </Text>
      </View>
      {isMutating ? (
        <LoadingSpinner />
      ) : (
        <View className="flex-row gap-3">
          <Button
            label="Edit"
            size="compact"
            variant="ghost"
            onPress={editor.startEditing}
          />
          <Button
            label="Delete"
            size="compact"
            variant="danger"
            onPress={() => void onDelete(log)}
          />
        </View>
      )}
    </AnimatedPresence>
  );
}
