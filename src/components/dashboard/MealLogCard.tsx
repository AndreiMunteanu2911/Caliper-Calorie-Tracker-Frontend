import { Trash2 } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated from 'react-native-reanimated';

import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { motion } from '@/src/lib/motion';
import type { MealLogItem } from '@/src/types/api';

type MealLogCardProps = {
  log: MealLogItem;
  isMutating: boolean;
  onDelete: (log: MealLogItem) => Promise<void>;
};

export function MealLogCard({
  log,
  isMutating,
  onDelete,
}: MealLogCardProps) {
  const router = useRouter();

  function navigateToEdit() {
    router.push({
      pathname: '/food-detail',
      params: {
        external_id: log.external_id,
        source: log.source,
        name: log.food_name,
        brand: '',
        calories: String(log.calories / (log.quantity_g / 100)),
        protein: String(log.protein / (log.quantity_g / 100)),
        carbs: String(log.carbs / (log.quantity_g / 100)),
        fats: String(log.fats / (log.quantity_g / 100)),
        fiber: String(log.fiber / (log.quantity_g / 100)),
        sugar: String(log.sugar / (log.quantity_g / 100)),
        sodium_mg: String(log.sodium_mg / (log.quantity_g / 100)),
        saturated_fat: String(
          log.saturated_fat / (log.quantity_g / 100),
        ),
        serving_size_g: '100',
        log_id: log.id,
        existing_weight: String(Math.round(log.quantity_g)),
        existing_meal_type: log.meal_type,
      },
    });
  }

  return (
    <Animated.View
      className="rounded-2xl border border-white/10 bg-[#292929]"
      entering={motion.enter}
      exiting={motion.exit}
      layout={motion.layout}>
      <View className="flex-row items-start gap-2.5 py-2">
        <View className="w-1 self-stretch rounded-full bg-accent" />
        <Pressable
          accessibilityHint="Edit this food"
          accessibilityRole="button"
          className="min-w-0 flex-1"
          onPress={navigateToEdit}>
          <Text className="text-sm font-black text-white" numberOfLines={1}>
            {log.food_name}
          </Text>
          <Text className="mt-0.5 text-xs font-semibold text-white/40">
            {Math.round(log.quantity_g)}g &middot; {Math.round(log.calories)} kcal
          </Text>
          <View className="mt-2 flex-row gap-1.5">
            <View className="rounded-lg bg-protein/15 px-2 py-0.5">
              <Text className="text-xs font-bold text-protein">{log.protein.toFixed(1)}g P</Text>
            </View>
            <View className="rounded-lg bg-carbs/15 px-2 py-0.5">
              <Text className="text-xs font-bold text-carbs">{log.carbs.toFixed(1)}g C</Text>
            </View>
            <View className="rounded-lg bg-fats/15 px-2 py-0.5">
              <Text className="text-xs font-bold text-fats">{log.fats.toFixed(1)}g F</Text>
            </View>
          </View>
        </Pressable>
        {isMutating ? (
          <LoadingSpinner />
        ) : (
          <Pressable
            accessibilityLabel={`Delete ${log.food_name}`}
            accessibilityRole="button"
            className="h-8 w-8 items-center justify-center rounded-lg border border-accent bg-brand"
            onPress={() => void onDelete(log)}>
            <Trash2 color="#FF5A16" size={13} strokeWidth={2.4} />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}
