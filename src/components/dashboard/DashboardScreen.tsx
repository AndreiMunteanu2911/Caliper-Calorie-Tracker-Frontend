import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { AuthCard } from '@/src/components/auth/AuthCard';
import { MealLogCard } from '@/src/components/dashboard/MealLogCard';
import { MacroRing } from '@/src/components/dashboard/MacroRing';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
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
        <ActivityIndicator color="#b7f34a" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerClassName="gap-6 px-5 pb-12 pt-16"
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor="#b7f34a" />
      }>
      <View className="gap-1">
        <Text className="text-sm font-semibold uppercase tracking-widest text-lime">
          Daily fuel
        </Text>
        <Text className="text-4xl font-bold text-white">Your macros</Text>
        <Text className="text-base text-muted">
          {user?.email ?? 'Sign in through Supabase to load your day.'}
        </Text>
      </View>

      {!user ? <AuthCard /> : null}

      {error ? (
        <View className="rounded-2xl border border-red-500/40 bg-red-950/30 p-4">
          <Text className="text-red-200">{error}</Text>
        </View>
      ) : null}

      {progress && data ? (
        <>
          <View className="rounded-3xl bg-panel p-6">
            <Text className="text-sm text-muted">Calories remaining</Text>
            <View className="mt-2 flex-row items-end justify-between">
              <Text className="text-5xl font-bold text-white">
                {Math.round(progress.remaining.calories)}
              </Text>
              <Text className="pb-2 text-sm text-muted">
                {Math.round(progress.consumed.calories)} /{' '}
                {Math.round(progress.targets.calories)} kcal
              </Text>
            </View>
            <View className="mt-5 h-3 overflow-hidden rounded-full bg-black/30">
              <View
                className="h-full rounded-full bg-lime"
                style={{
                  width: `${Math.min(
                    (progress.consumed.calories / progress.targets.calories) * 100,
                    100,
                  )}%`,
                }}
              />
            </View>
          </View>

          <View className="flex-row justify-between rounded-3xl bg-panel p-5">
            <MacroRing
              label="Protein"
              consumed={progress.consumed.protein}
              target={progress.targets.protein}
              colorClass="border-mint"
            />
            <MacroRing
              label="Carbs"
              consumed={progress.consumed.carbs}
              target={progress.targets.carbs}
              colorClass="border-amber"
            />
            <MacroRing
              label="Fats"
              consumed={progress.consumed.fats}
              target={progress.targets.fats}
              colorClass="border-lime"
            />
          </View>

          <View className="gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-white">Today&apos;s food</Text>
              <Pressable
                accessibilityRole="button"
                className="rounded-full bg-lime px-4 py-2"
                onPress={() => router.push('/scan')}>
                <Text className="font-bold text-canvas">Add food</Text>
              </Pressable>
            </View>
            {data.logs.length === 0 ? (
              <View className="rounded-3xl border border-dashed border-white/20 p-6">
                <Text className="text-center text-muted">
                  No food logged yet. Search or scan a product to start your day.
                </Text>
              </View>
            ) : (
              MEAL_TYPES.map((mealType) => {
                const logs = data.logs.filter((log) => log.meal_type === mealType);
                if (logs.length === 0) return null;
                return (
                  <View className="gap-2" key={mealType}>
                    <Text className="text-sm font-bold uppercase tracking-wider text-muted">
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
                  </View>
                );
              })
            )}
          </View>
        </>
      ) : (
        <View className="rounded-3xl bg-panel p-6">
          <Text className="text-base text-muted">
            No macro progress is available for this account yet.
          </Text>
        </View>
      )}

      {user ? <PrimaryButton label="Sign out" onPress={() => void signOut()} /> : null}
    </ScrollView>
  );
}
