import { ChevronRight, Flame, Utensils } from 'lucide-react-native';
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
      className="rounded-[24px] border border-white/10 bg-[#242424] p-4 shadow-card active:scale-[0.99] active:opacity-80"
      onPress={() => onPress(food)}>
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-carbs">
          <Utensils color="#101010" size={21} strokeWidth={2.5} />
        </View>
        <View className="flex-1 gap-1">
          <Text className="text-lg font-black text-white">{food.name}</Text>
          <Text className="text-sm text-white/55">
            {food.brand || food.source.replaceAll('_', ' ')}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5 rounded-xl bg-accentSoft px-3 py-2">
          <Flame color="#FF5A2F" size={15} strokeWidth={2.5} />
          <Text className="font-black text-brand">{Math.round(food.calories)}</Text>
        </View>
        <ChevronRight color="#A4A4A4" size={18} strokeWidth={2.4} />
      </View>
      <Text className="mt-3 text-sm text-white/55">
        Per 100g / P {food.protein.toFixed(1)} / C {food.carbs.toFixed(1)} / F{' '}
        {food.fats.toFixed(1)}
      </Text>
    </Pressable>
  );
}
