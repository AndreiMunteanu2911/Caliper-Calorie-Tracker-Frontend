import { Trash2 } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AnimatedPresence } from '@/src/components/ui/AnimatedPresence';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
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
        serving_size_g: '100',
        log_id: log.id,
        existing_weight: String(Math.round(log.quantity_g)),
        existing_meal_type: log.meal_type,
      },
    });
  }

  return (
    <AnimatedPresence className="flex-row items-center gap-3 rounded-2xl border border-white/10 bg-[#292929] px-4 py-4">
      <View className="h-10 w-1 rounded-full bg-accent" />
      <Pressable
        accessibilityHint="Edit this food"
        accessibilityRole="button"
        className="min-w-0 flex-1"
        onPress={navigateToEdit}>
        <Text className="text-base font-black text-white" numberOfLines={1}>
          {log.food_name}
        </Text>
        <Text className="mt-1 text-sm font-semibold text-white/40">
          {Math.round(log.quantity_g)}g &middot; {Math.round(log.calories)} kcal
        </Text>
        <View className="mt-3 flex-row gap-2">
          <View className="rounded-lg bg-protein/15 px-2.5 py-1">
            <Text className="text-xs font-bold text-protein">{log.protein.toFixed(1)}g P</Text>
          </View>
          <View className="rounded-lg bg-carbs/15 px-2.5 py-1">
            <Text className="text-xs font-bold text-carbs">{log.carbs.toFixed(1)}g C</Text>
          </View>
          <View className="rounded-lg bg-fats/15 px-2.5 py-1">
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
          className="h-10 w-10 items-center justify-center rounded-xl bg-dangerSoft"
          onPress={() => void onDelete(log)}>
          <Trash2 color="#C64035" size={15} strokeWidth={2.4} />
        </Pressable>
      )}
    </AnimatedPresence>
  );
}
