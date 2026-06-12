import { Pressable, Text, View } from 'react-native';

import type { FoodItem } from '@/src/types/api';

type FoodResultCardProps = {
  food: FoodItem;
  onPress: (food: FoodItem) => void;
};

export function FoodResultCard({ food, onPress }: FoodResultCardProps) {
  return (
    <Pressable
      accessibilityHint="Opens quick log options"
      accessibilityRole="button"
      className="rounded-[24px] border border-line bg-surface p-4 shadow-sm active:scale-[0.99] active:opacity-80"
      onPress={() => onPress(food)}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text className="text-lg font-black text-ink">{food.name}</Text>
          <Text className="text-sm text-muted">
            {food.brand || food.source.replaceAll('_', ' ')}
          </Text>
        </View>
        <View className="rounded-xl bg-accentSoft px-3 py-2">
          <Text className="font-black text-brand">{Math.round(food.calories)} kcal</Text>
        </View>
      </View>
      <Text className="mt-3 text-sm text-muted">
        Per 100g / P {food.protein.toFixed(1)} / C {food.carbs.toFixed(1)} / F{' '}
        {food.fats.toFixed(1)}
      </Text>
    </Pressable>
  );
}
