import { useRouter } from 'expo-router';
import {
  ArrowUpRight,
  CirclePlus,
  Flame,
  LogOut,
  ScanLine,
  TriangleAlert,
  Utensils,
} from 'lucide-react-native';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { MealLogCard } from '@/src/components/dashboard/MealLogCard';
import { MacroRing } from '@/src/components/dashboard/MacroRing';
import { AppPage } from '@/src/components/layout/AppPage';
import { BrandMark } from '@/src/components/layout/BrandMark';
import { SectionHeader } from '@/src/components/layout/SectionHeader';
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

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

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
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  const caloriePercentage = progress?.targets.calories
    ? Math.min(progress.consumed.calories / progress.targets.calories, 1)
    : 0;

  if (isAuthLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-brand">
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-brand"
      contentContainerClassName="px-4 pb-32 pt-5 sm:px-6 sm:pt-8"
      refreshControl={
        <RefreshControl
          colors={['#FF5A2F']}
          progressBackgroundColor="#242424"
          refreshing={isLoading}
          onRefresh={refresh}
          tintColor="#FF5A2F"
        />
      }>
      <AppPage>
        <View className="gap-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <BrandMark compact />
              <View>
                <Text className="text-xs font-bold uppercase tracking-[1.5px] text-white/45">
                  Good morning
                </Text>
                <Text className="mt-1 text-xl font-black tracking-[-0.7px] text-white">
                  Your nutrition
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-2">
              <Pressable
                accessibilityLabel={`Sign out${user?.email ? ` of ${user.email}` : ''}`}
                accessibilityRole="button"
                className="h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5"
                onPress={() => void signOut()}>
                <LogOut color="#FFFFFF" size={19} strokeWidth={2.5} />
              </Pressable>
            </View>
          </View>

          {error && data ? (
            <AnimatedPresence className="rounded-2xl bg-dangerSoft p-4">
              <Text className="font-semibold text-danger">{error}</Text>
            </AnimatedPresence>
          ) : null}

          {progress && data ? (
            <View className="gap-7">
              <View className="gap-4">
                <View className="flex-row items-center justify-between rounded-[26px] border border-line bg-white px-3 py-3 shadow-card">
                  {WEEK_DAYS.map((day, index) => {
                    const date = new Date(today);
                    date.setDate(today.getDate() - mondayOffset + index);
                    const isToday = index === mondayOffset;
                    return (
                      <View className="flex-1 items-center gap-2" key={day}>
                        <Text className="text-[10px] font-black uppercase text-muted">
                          {day}
                        </Text>
                        <View
                          className={`h-9 w-9 items-center justify-center rounded-full ${
                            isToday ? 'bg-fats' : ''
                          }`}>
                          <Text className="text-xs font-black text-ink">
                            {date.getDate()}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                <Text className="text-3xl font-black tracking-[-1.5px] text-white">
                  Count your daily calories
                </Text>

                <View className="relative min-h-72 justify-between overflow-hidden rounded-[30px] border border-white/30 bg-fats p-6 shadow-card">
                    <View className="absolute -right-14 -top-16 h-44 w-44 rounded-full border-[28px] border-white/20" />
                    <View className="absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <View>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base font-black text-brand">Calories</Text>
                        <View className="h-10 w-10 items-center justify-center rounded-full bg-white/55">
                          <Flame color="#101010" size={19} strokeWidth={2.5} />
                        </View>
                      </View>
                      <View className="mt-7 items-center">
                        <View className="h-40 w-40 items-center justify-center rounded-full border-[18px] border-brand shadow-soft">
                          <Text className="text-4xl font-black tracking-[-2px] text-brand">
                            {Math.max(0, Math.round(progress.remaining.calories))}
                          </Text>
                          <Text className="mt-1 text-xs font-black uppercase tracking-[1.5px] text-brand/55">
                            Left
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="mt-6">
                      <View className="h-2 overflow-hidden rounded-full bg-brand/10">
                        <View
                          className="h-full rounded-full bg-brand"
                          style={{
                            width: `${Math.min(
                              caloriePercentage * 100,
                              100,
                            )}%`,
                          }}
                        />
                      </View>
                      <View className="mt-3 flex-row justify-between">
                        <Text className="text-xs font-bold text-brand/55">
                          {Math.round(progress.consumed.calories)} eaten
                        </Text>
                        <Text className="text-xs font-bold text-brand/55">
                          {Math.round(progress.targets.calories)} goal
                        </Text>
                      </View>
                    </View>
                </View>

                <View className="flex-row gap-3">
                  <MacroRing
                    consumed={progress.consumed.protein}
                    label="Protein"
                    softColorClass="bg-protein"
                    target={progress.targets.protein}
                  />
                  <MacroRing
                    consumed={progress.consumed.carbs}
                    label="Carbs"
                    softColorClass="bg-carbs"
                    target={progress.targets.carbs}
                  />
                </View>
                <View className="flex-row gap-3">
                  <MacroRing
                    consumed={progress.consumed.fats}
                    label="Fats"
                    softColorClass="bg-fats"
                    target={progress.targets.fats}
                  />
                  <Pressable
                    accessibilityRole="button"
                    className="relative min-w-0 flex-1 justify-between overflow-hidden rounded-[28px] border border-white/20 bg-accent p-5 shadow-card"
                    onPress={() => router.push('/scan')}>
                    <View className="absolute -right-10 -top-10 h-28 w-28 rounded-full border-[20px] border-white/10" />
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-white/15">
                      <ScanLine color="#FFFFFF" size={20} strokeWidth={2.6} />
                    </View>
                    <Text className="mt-8 text-2xl font-black leading-7 tracking-[-0.8px] text-white">
                      Log your next meal
                    </Text>
                    <View className="mt-4 flex-row items-center gap-2">
                      <Text className="text-sm font-black text-white">Open analysis</Text>
                      <ArrowUpRight color="#FFFFFF" size={17} strokeWidth={2.6} />
                    </View>
                  </Pressable>
                </View>
              </View>

              <View className="gap-4">
                <SectionHeader
                  eyebrow="Your meals"
                  title="Today's food"
                  description={`${data.logs.length} ${
                    data.logs.length === 1 ? 'item' : 'items'
                  } logged across the day`}
                  action={
                    <Pressable
                      accessibilityRole="button"
                      className="h-10 flex-row items-center justify-center gap-2 rounded-full bg-white/10 px-4"
                      onPress={() => router.push('/scan')}>
                      <CirclePlus color="#FFFFFF" size={16} strokeWidth={2.6} />
                      <Text className="text-sm font-black text-white">Add food</Text>
                    </Pressable>
                  }
                />

                {data.logs.length === 0 ? (
                  <Pressable
                    accessibilityRole="button"
                    className="items-center rounded-[30px] border border-white/15 bg-[#1A1A1A] p-10 shadow-card"
                    onPress={() => router.push('/scan')}>
                    <View className="mb-5 h-16 w-16 items-center justify-center rounded-2xl bg-accent">
                      <Utensils color="#FFFFFF" size={28} strokeWidth={2.5} />
                    </View>
                    <Text className="text-xl font-black tracking-[-0.7px] text-white">
                      Log your first meal
                    </Text>
                    <Text className="mt-2 text-center leading-5 text-white/55">
                      Scan a barcode, search the food database, or analyze a meal photo.
                    </Text>
                  </Pressable>
                ) : (
                  <View className="flex-row flex-wrap gap-4">
                    {MEAL_TYPES.map((mealType) => {
                      const logs = data.logs.filter((log) => log.meal_type === mealType);
                      if (logs.length === 0) return null;
                      return (
                        <AnimatedPresence
                          className="w-full gap-3 rounded-[28px] border border-white/15 bg-[#1A1A1A] p-5 shadow-card"
                          key={mealType}>
                          <View className="flex-row items-center justify-between">
                            <Text className="text-xs font-black uppercase tracking-[2px] text-white/60">
                              {MEAL_LABELS[mealType]}
                            </Text>
                            <View className="h-2 w-2 rounded-full bg-accent" />
                          </View>
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
                    })}
                  </View>
                )}
              </View>
            </View>
          ) : error ? (
            <AnimatedPresence className="items-center rounded-[28px] border border-danger/30 bg-[#1A1A1A] p-8 shadow-card">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-dangerSoft">
                <TriangleAlert color="#C64035" size={23} strokeWidth={2.5} />
              </View>
              <Text className="mt-4 text-xl font-black text-white">
                Dashboard unavailable
              </Text>
              <Text className="mt-2 max-w-sm text-center leading-6 text-white/55">
                We could not load today&apos;s nutrition data.
              </Text>
              <View className="mt-5">
                <Button
                  label="Try again"
                  variant="primary"
                  onPress={() => void refresh()}
                />
              </View>
            </AnimatedPresence>
          ) : (
            <AnimatedPresence className="items-center rounded-[28px] border border-white/10 bg-[#1A1A1A] p-8 shadow-card">
              <LoadingSpinner color="white" />
              <Text className="mt-3 text-base text-white/55">Loading your daily targets...</Text>
            </AnimatedPresence>
          )}
        </View>
      </AppPage>
    </ScrollView>
  );
}
