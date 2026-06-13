import { useRouter } from 'expo-router';
import {
  Cookie,
  Moon,
  Plus,
  Sun,
  Sunrise,
  Utensils,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, RefreshControl, Text, View } from 'react-native';

import { MealLogCard } from '@/src/components/dashboard/MealLogCard';
import { AppPage } from '@/src/components/layout/AppPage';
import { PageHeader } from '@/src/components/layout/PageHeader';
import { Button } from '@/src/components/ui/Button';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
import { useDashboardData } from '@/src/hooks/useDashboardData';
import { MEAL_TYPES, type MealType } from '@/src/types/api';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
};

const MEAL_META: Record<
  MealType,
  { icon: LucideIcon; color: string; background: string }
> = {
  breakfast: { icon: Sunrise, color: '#101010', background: 'bg-carbs' },
  lunch: { icon: Sun, color: '#101010', background: 'bg-protein' },
  dinner: { icon: Moon, color: '#101010', background: 'bg-fats' },
  snack: { icon: Cookie, color: '#FFFFFF', background: 'bg-accent' },
};

export function DiaryScreen() {
  const router = useRouter();
  const { data, isLoading, mutatingId, error, refresh, deleteLog } =
    useDashboardData();
  const totalCalories = data?.logs.reduce((sum, log) => sum + log.calories, 0) ?? 0;
  const totalProtein = data?.logs.reduce((sum, log) => sum + log.protein, 0) ?? 0;
  const totalCarbs = data?.logs.reduce((sum, log) => sum + log.carbs, 0) ?? 0;
  const totalFats = data?.logs.reduce((sum, log) => sum + log.fats, 0) ?? 0;

  return (
    <ScrollbarContainer
      className="flex-1 bg-brand"
      contentContainerClassName="px-5 pb-32 pt-7"
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refresh}
          tintColor="#FF5A16"
        />
      }>
      <AppPage>
        <PageHeader
          title="Today's diary"
          description={new Intl.DateTimeFormat(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          }).format(new Date())}
          action={
            <Button
              label="Add food"
              size="compact"
              onPress={() => router.push('/scan')}
            />
          }
        />

        {error ? (
          <Text className="mt-6 rounded-2xl bg-dangerSoft p-4 font-semibold text-danger">
            {error}
          </Text>
        ) : null}

        {!data ? (
          <View className="items-center py-24">
            <LoadingSpinner />
          </View>
        ) : (
          <View className="mt-7 gap-5">
            <View className="overflow-hidden rounded-[30px] bg-accent p-6 shadow-glow">
              <View className="absolute -right-10 -top-12 h-40 w-40 rounded-full border-[26px] border-white/10" />
              <View className="flex-row items-start justify-between">
                <View>
                  <Text className="text-sm font-black uppercase tracking-[1.5px] text-white/65">
                    Total today
                  </Text>
                  <Text className="mt-2 text-5xl font-black tracking-[-2.5px] text-white">
                    {Math.round(totalCalories)}
                  </Text>
                  <Text className="mt-1 font-bold text-white/65">calories logged</Text>
                </View>
                <View className="h-12 w-12 items-center justify-center rounded-full bg-white/20">
                  <Utensils color="#FFFFFF" size={21} strokeWidth={2.5} />
                </View>
              </View>
              <View className="mt-7 flex-row gap-2">
                {[
                  { label: 'Protein', value: totalProtein },
                  { label: 'Carbs', value: totalCarbs },
                  { label: 'Fat', value: totalFats },
                ].map((macro) => (
                  <View className="min-w-0 flex-1 rounded-2xl bg-black/15 px-3 py-3" key={macro.label}>
                    <Text className="text-xs font-bold text-white/55">{macro.label}</Text>
                    <Text className="mt-1 text-lg font-black text-white">
                      {Math.round(macro.value)}g
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {MEAL_TYPES.map((mealType) => {
              const logs = data.logs.filter((log) => log.meal_type === mealType);
              const calories = logs.reduce((sum, log) => sum + log.calories, 0);
              const { icon: MealIcon, color, background } = MEAL_META[mealType];
              return (
                <View
                  className="overflow-hidden rounded-[28px] border border-white/10 bg-[#1D1D1D] p-3 shadow-card"
                  key={mealType}>
                  <View className="flex-row items-center justify-between px-2 py-2">
                    <View className="flex-row items-center gap-3">
                      <View className={`h-11 w-11 items-center justify-center rounded-2xl ${background}`}>
                        <MealIcon color={color} size={20} strokeWidth={2.5} />
                      </View>
                      <View>
                        <Text className="text-lg font-black text-white">
                          {MEAL_LABELS[mealType]}
                        </Text>
                        <Text className="mt-0.5 text-xs font-semibold text-white/40">
                          {logs.length === 0
                            ? 'Nothing logged'
                            : `${logs.length} ${logs.length === 1 ? 'item' : 'items'}`}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-sm font-black text-white/65">
                      {Math.round(calories)} kcal
                    </Text>
                  </View>
                  {logs.length > 0 ? (
                    <View className="mt-2 gap-2">
                      {logs.map((log) => (
                        <MealLogCard
                          isMutating={mutatingId === log.id}
                          key={log.id}
                          log={log}
                          onDelete={deleteLog}
                        />
                      ))}
                    </View>
                  ) : (
                    <Pressable
                      accessibilityRole="button"
                      className="mt-2 flex-row items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/5 py-4 active:bg-white/10"
                      onPress={() => router.push('/scan')}>
                      <Plus color="#FF5A16" size={17} strokeWidth={2.7} />
                      <Text className="text-sm font-black text-accent">
                        Add {MEAL_LABELS[mealType].toLowerCase()}
                      </Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </AppPage>
    </ScrollbarContainer>
  );
}
