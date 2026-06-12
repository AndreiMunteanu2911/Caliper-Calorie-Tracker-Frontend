import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { MealTypeSelector } from '@/src/components/food/MealTypeSelector';
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
      <View className="gap-4 rounded-2xl border border-lime/30 bg-panel p-4">
        <Text className="text-lg font-bold text-white">{log.food_name}</Text>
        <MealTypeSelector value={editor.mealType} onChange={editor.setMealType} />
        <TextInput
          accessibilityLabel={`Weight for ${log.food_name}`}
          className="h-12 rounded-xl bg-black/20 px-4 text-lg text-white"
          keyboardType="decimal-pad"
          onChangeText={editor.setWeight}
          value={editor.weight}
        />
        <View className="flex-row gap-3">
          <Pressable
            accessibilityRole="button"
            className="flex-1 items-center rounded-xl bg-white/10 py-3"
            disabled={isMutating}
            onPress={editor.cancelEditing}>
            <Text className="font-semibold text-white">Cancel</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            className="flex-1 items-center rounded-xl bg-lime py-3 disabled:opacity-50"
            disabled={!editor.isValid || isMutating}
            onPress={() => void save()}>
            {isMutating ? (
              <ActivityIndicator color="#07110d" />
            ) : (
              <Text className="font-bold text-canvas">Save</Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-3 rounded-2xl bg-panel p-4">
      <View className="flex-1">
        <Text className="text-base font-bold text-white">{log.food_name}</Text>
        <Text className="mt-1 text-sm text-muted">
          {Math.round(log.quantity_g)}g / {Math.round(log.calories)} kcal / P{' '}
          {log.protein.toFixed(1)}g
        </Text>
      </View>
      {isMutating ? (
        <ActivityIndicator color="#b7f34a" />
      ) : (
        <View className="flex-row gap-3">
          <Pressable accessibilityRole="button" onPress={editor.startEditing}>
            <Text className="font-semibold text-lime">Edit</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => void onDelete(log)}>
            <Text className="font-semibold text-red-300">Delete</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
