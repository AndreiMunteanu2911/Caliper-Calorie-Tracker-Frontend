import { useRouter } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { MealLogCard } from '@/src/components/dashboard/MealLogCard';
import { MacroRing } from '@/src/components/dashboard/MacroRing';
import { AppPage } from '@/src/components/layout/AppPage';
import { BrandMark } from '@/src/components/layout/BrandMark';
import { AnimatedPresence } from '@/src/components/ui/AnimatedPresence';
import { Button } from '@/src/components/ui/Button';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { useAuth } from '@/src/hooks/useAuth';
import { useDashboardData } from '@/src/hooks/useDashboardData';
import { MEAL_TYPES, type MealType } from '@/src/types/api';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
};

export function DashboardScreen() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, signOut } = useAuth();
  const {
    data,
    isLoading,
    mutatingId,
    error,
    refresh,
    updateLog,
    deleteLog,
  } = useDashboardData();
  const progress = data?.progress;

  if (isAuthLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerClassName="px-4 pb-12 pt-6 sm:px-6 sm:pt-10"
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor="#173F35" />
      }>
      <AppPage>
        <View className="gap-6">
          <View className="flex-row items-center justify-between">
            <BrandMark />
            <Pressable
              accessibilityLabel={`Sign out${user?.email ? ` of ${user.email}` : ''}`}
              accessibilityRole="button"
              className="min-h-11 items-center justify-center rounded-2xl border border-line bg-surface px-4"
              onPress={() => void signOut()}>
              <Text className="text-sm font-black text-brand">Sign out</Text>
            </Pressable>
          </View>

          <View className="gap-1">
            <Text className="text-sm font-black uppercase tracking-[2px] text-brand">
              Today&apos;s nutrition
            </Text>
            <Text className="text-4xl font-black tracking-tight text-ink sm:text-5xl">
              Stay on target.
            </Text>
            <Text className="text-base text-muted">
              Your totals update whenever you add or edit a meal.
            </Text>
          </View>

          {error ? (
            <AnimatedPresence className="rounded-2xl bg-dangerSoft p-4">
              <Text className="font-semibold text-danger">{error}</Text>
            </AnimatedPresence>
          ) : null}

          {progress && data ? (
            <View className="gap-6 lg:flex-row">
              <View className="gap-4 lg:w-[42%]">
                <View className="overflow-hidden rounded-[32px] bg-brand p-6 shadow-card sm:p-8">
                  <View className="absolute -right-14 -top-16 h-44 w-44 rounded-full bg-accent/20" />
                  <Text className="text-sm font-bold text-white/70">
                    Calories remaining
                  </Text>
                  <Text className="mt-2 text-6xl font-black tracking-tight text-white">
                    {Math.round(progress.remaining.calories)}
                  </Text>
                  <Text className="mt-1 text-sm font-semibold text-white/70">
                    of {Math.round(progress.targets.calories)} kcal
                  </Text>
                  <View className="mt-8 h-3 overflow-hidden rounded-full bg-white/15">
                    <View
                      className="h-full rounded-full bg-accent"
                      style={{
                        width: `${Math.min(
                          (progress.consumed.calories / progress.targets.calories) *
                            100,
                          100,
                        )}%`,
                      }}
                    />
                  </View>
                  <View className="mt-4 flex-row justify-between">
                    <Text className="text-xs font-bold text-white/60">Consumed</Text>
                    <Text className="text-xs font-black text-accent">
                      {Math.round(progress.consumed.calories)} kcal
                    </Text>
                  </View>
                </View>

                <View className="flex-row flex-wrap gap-3">
                  <MacroRing
                    colorClass="bg-protein"
                    consumed={progress.consumed.protein}
                    label="Protein"
                    softColorClass="bg-proteinSoft"
                    target={progress.targets.protein}
                  />
                  <MacroRing
                    colorClass="bg-carbs"
                    consumed={progress.consumed.carbs}
                    label="Carbs"
                    softColorClass="bg-carbsSoft"
                    target={progress.targets.carbs}
                  />
                  <MacroRing
                    colorClass="bg-fats"
                    consumed={progress.consumed.fats}
                    label="Fats"
                    softColorClass="bg-fatsSoft"
                    target={progress.targets.fats}
                  />
                </View>
              </View>

              <View className="gap-4 lg:flex-1">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-2xl font-black text-ink">Today&apos;s food</Text>
                    <Text className="text-sm text-muted">
                      {data.logs.length} {data.logs.length === 1 ? 'item' : 'items'} logged
                    </Text>
                  </View>
                  <Button
                    label="+ Add food"
                    size="compact"
                    onPress={() => router.push('/scan')}
                  />
                </View>

                {data.logs.length === 0 ? (
                  <Pressable
                    accessibilityRole="button"
                    className="items-center rounded-[28px] border border-dashed border-brand/30 bg-surface p-8"
                    onPress={() => router.push('/scan')}>
                    <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-accentSoft">
                      <Text className="text-2xl font-black text-brand">+</Text>
                    </View>
                    <Text className="text-lg font-black text-ink">Log your first meal</Text>
                    <Text className="mt-2 text-center leading-5 text-muted">
                      Scan a barcode, search the food database, or analyze a meal photo.
                    </Text>
                  </Pressable>
                ) : (
                  MEAL_TYPES.map((mealType) => {
                    const logs = data.logs.filter((log) => log.meal_type === mealType);
                    if (logs.length === 0) return null;
                    return (
                      <AnimatedPresence className="gap-2" key={mealType}>
                        <Text className="text-xs font-black uppercase tracking-[2px] text-muted">
                          {MEAL_LABELS[mealType]}
                        </Text>
                        {logs.map((log) => (
                          <MealLogCard
                            isMutating={mutatingId === log.id}
                            key={log.id}
                            log={log}
                            onDelete={deleteLog}
                            onUpdate={updateLog}
                          />
                        ))}
                      </AnimatedPresence>
                    );
                  })
                )}
              </View>
            </View>
          ) : (
            <AnimatedPresence className="items-center rounded-[28px] border border-line bg-surface p-8">
              <LoadingSpinner />
              <Text className="mt-3 text-base text-muted">Loading your daily targets...</Text>
            </AnimatedPresence>
          )}
        </View>
      </AppPage>
    </ScrollView>
  );
}
