import { CaretRightIcon, FlameIcon, ForkKnifeIcon } from 'phosphor-react-native';
import { Pressable, Text, View } from 'react-native';

import { shadows } from '@/src/lib/shadows';
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
      className="rounded-2xl border border-white/10 bg-[#242424] p-3.5 active:scale-[0.99] active:opacity-80"
      style={shadows.card}
      onPress={() => onPress(food)}>
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-carbs">
          <ForkKnifeIcon color="#101010" size={18} weight="bold" />
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-base font-black text-white">{food.name}</Text>
          <Text className="text-xs text-white/55">
            {food.brand || food.source.replaceAll('_', ' ')}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5 rounded-xl bg-accentSoft px-2.5 py-1.5">
          <FlameIcon color="#FF5A16" size={13} weight="bold" />
          <Text className="text-sm font-black text-brand">{Math.round(food.calories)}</Text>
        </View>
        <CaretRightIcon color="#A4A4A4" size={16} />
      </View>
      <Text className="mt-2 text-xs text-white/55">
        Per 100g / P {food.protein.toFixed(1)} / C {food.carbs.toFixed(1)} / F{' '}
        {food.fats.toFixed(1)}
      </Text>
    </Pressable>
  );
}
