import { useFocusEffect, useRouter } from 'expo-router';
import {
  CaretLeftIcon,
  CaretRightIcon,
  CookieIcon,
  MoonIcon,
  PlusIcon,
  SunIcon,
  SunHorizonIcon,
  ForkKnifeIcon,
  type Icon,
} from 'phosphor-react-native';
import { Pressable, RefreshControl, Text, View } from 'react-native';

import { MealLogCard } from '@/src/components/dashboard/MealLogCard';
import { AppPage } from '@/src/components/layout/AppPage';
import { PageHeader } from '@/src/components/layout/PageHeader';
import { Button } from '@/src/components/ui/Button';
import { CalendarPicker } from '@/src/components/ui/CalendarPicker';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
import { useDashboardData } from '@/src/hooks/useDashboardData';
import {
  localDateString,
  parseLocalDate,
  shiftLocalDate,
} from '@/src/lib/dates';
import { MEAL_TYPES, type MealType } from '@/src/types/api';
import { useCallback, useState } from 'react';
import {
  MotionFade,
  MotionPressable,
  MotionStagger,
  PageSkeleton,
} from '@/src/lib/motion';
import { shadows } from '@/src/lib/shadows';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
};

const MEAL_META: Record<
  MealType,
  { icon: Icon; color: string; background: string }
> = {
  breakfast: { icon: SunHorizonIcon, color: '#101010', background: 'bg-carbs' },
  lunch: { icon: SunIcon, color: '#101010', background: 'bg-protein' },
  dinner: { icon: MoonIcon, color: '#101010', background: 'bg-fats' },
  snack: { icon: CookieIcon, color: '#FFFFFF', background: 'bg-accent' },
};

function diaryDateLabel(value: string): string {
  const today = localDateString();
  if (value === today) return 'Today';
  if (value === shiftLocalDate(today, -1)) return 'Yesterday';
  if (value === shiftLocalDate(today, 1)) return 'Tomorrow';
  return parseLocalDate(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function DiaryScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(localDateString);
  const [collapsedMeals, setCollapsedMeals] = useState<
    Partial<Record<MealType, boolean>>
  >({});
  useFocusEffect(
    useCallback(() => {
      setSelectedDate(localDateString());
    }, []),
  );
  const { data, isLoading, mutatingId, error, refresh, deleteLog } =
    useDashboardData(selectedDate);
  const totalCalories = data?.logs.reduce((sum, log) => sum + log.calories, 0) ?? 0;
  const totalProtein = data?.logs.reduce((sum, log) => sum + log.protein, 0) ?? 0;
  const totalCarbs = data?.logs.reduce((sum, log) => sum + log.carbs, 0) ?? 0;
  const totalFats = data?.logs.reduce((sum, log) => sum + log.fats, 0) ?? 0;

  return (
    <ScrollbarContainer
      className="flex-1 bg-brand"
      contentContainerClassName="pb-32 pt-4 sm:pt-5"
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refresh}
          tintColor="#FF5A16"
        />
      }>
      <AppPage>
        <PageHeader
          title={selectedDate === localDateString() ? "Today's diary" : 'Diary'}
          description={new Intl.DateTimeFormat(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          }).format(parseLocalDate(selectedDate))}
          action={
            <Button
              label="Add food"
              size="compact"
              onPress={() =>
                router.push({ pathname: '/scan', params: { date: selectedDate } })
              }
            />
          }
        />

        <View className="mt-4 rounded-2xl border border-white/10 bg-[#232220] p-3">
          <View className="flex-row items-center gap-2">
            <Pressable
              accessibilityLabel="Previous day"
              className="h-10 w-10 items-center justify-center rounded-xl bg-white/5"
              onPress={() => {
                const next = shiftLocalDate(selectedDate, -1);
                setSelectedDate(next);
              }}>
              <CaretLeftIcon color="#FFFFFF" size={18} />
            </Pressable>
            <View className="min-w-0 flex-1">
              <CalendarPicker
                displayValue={diaryDateLabel(selectedDate)}
                label="Diary date"
                value={selectedDate}
                onChange={setSelectedDate}
              />
            </View>
            <Pressable
              accessibilityLabel="Next day"
              className="h-10 w-10 items-center justify-center rounded-xl bg-white/5"
              onPress={() => {
                const next = shiftLocalDate(selectedDate, 1);
                setSelectedDate(next);
              }}>
              <CaretRightIcon color="#FFFFFF" size={18} />
            </Pressable>
          </View>
        </View>

        {error ? (
          <Text className="mt-5 rounded-xl bg-dangerSoft p-3 font-semibold text-danger">
            {error}
          </Text>
        ) : null}

        {!data ? (
          <PageSkeleton />
        ) : (
          <View className="mt-5 gap-4" key={selectedDate}>
            <View
              className="overflow-hidden rounded-2xl bg-accent p-3.5"
              style={shadows.glow}>
              <View className="absolute -right-8 -top-9 h-28 w-28 rounded-full border-8 border-white/10" />
              <View className="flex-row items-start justify-between">
                <View>
                  <Text className="text-xs font-black uppercase tracking-widest text-white/65">
                    Total today
                  </Text>
                  <Text className="mt-1 text-2xl font-black tracking-tight text-white">
                    {Math.round(totalCalories)}
                  </Text>
                  <Text className="mt-0.5 text-xs font-bold text-white/65">calories logged</Text>
                </View>
                <View className="h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <ForkKnifeIcon color="#FFFFFF" size={15} />
                </View>
              </View>
              <View className="mt-4 flex-row gap-1.5">
                {[
                  { label: 'Protein', value: totalProtein },
                  { label: 'Carbs', value: totalCarbs },
                  { label: 'Fat', value: totalFats },
                ].map((macro) => (
                  <View className="min-w-0 flex-1 rounded-xl bg-black/15 px-2 py-2" key={macro.label}>
                    <Text className="text-xs font-bold text-white/55">{macro.label}</Text>
                    <Text className="mt-0.5 text-xs font-black text-white">
                      {Math.round(macro.value)}g
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {MEAL_TYPES.map((mealType, mealIndex) => {
              const logs = data.logs.filter((log) => log.meal_type === mealType);
              const calories = logs.reduce((sum, log) => sum + log.calories, 0);
              const protein = logs.reduce((sum, log) => sum + log.protein, 0);
              const carbs = logs.reduce((sum, log) => sum + log.carbs, 0);
              const fats = logs.reduce((sum, log) => sum + log.fats, 0);
              const { icon: MealIcon, color, background } = MEAL_META[mealType];
              const collapsed = collapsedMeals[mealType] ?? false;
              return (
                <MotionStagger index={mealIndex} key={mealType}>
                <View
                  className="overflow-hidden rounded-2xl border border-white/10 bg-[#1D1D1D] p-2"
                  style={shadows.card}>
                  <MotionPressable
                    accessibilityLabel={`${collapsed ? 'Expand' : 'Collapse'} ${MEAL_LABELS[mealType]}`}
                    className="flex-row items-center justify-between px-1 py-1"
                    onPress={() =>
                      setCollapsedMeals((current) => ({
                        ...current,
                        [mealType]: !collapsed,
                      }))
                    }>
                    <View className="flex-row items-center gap-2">
                      <View className={`h-7 w-7 items-center justify-center rounded-lg ${background}`}>
                        <MealIcon color={color} size={14} />
                      </View>
                      <View>
                        <Text className="text-sm font-black text-white">
                          {MEAL_LABELS[mealType]}
                        </Text>
                        <Text className="text-xs font-semibold text-white/40">
                          {logs.length === 0
                            ? 'Nothing logged'
                            : `${logs.length} ${logs.length === 1 ? 'item' : 'items'}`}
                        </Text>
                      </View>
                    </View>
                    <View className="items-end gap-0.5">
                      <Text className="text-xs font-black text-white/65">
                        {Math.round(calories)} kcal
                      </Text>
                      {logs.length > 0 ? (
                        <Text className="text-xs font-bold text-white/40">
                          P {Math.round(protein)} &middot; C {Math.round(carbs)} &middot; F {Math.round(fats)}
                        </Text>
                      ) : null}
                    </View>
                  </MotionPressable>
                  {!collapsed && logs.length > 0 ? (
                    <View className="mt-1.5 gap-1.5">
                      {logs.map((log) => (
                        <MealLogCard
                          isMutating={mutatingId === log.id}
                          key={log.id}
                          log={log}
                          onDelete={deleteLog}
                        />
                      ))}
                    </View>
                  ) : !collapsed ? (
                    <MotionFade distance={3}>
                      <Pressable
                        accessibilityRole="button"
                        className="mt-1.5 flex-row items-center justify-center gap-1 rounded-xl border border-dashed border-white/15 bg-white/5 py-2 active:bg-white/10"
                        onPress={() =>
                          router.push({
                            pathname: '/scan',
                            params: { date: selectedDate },
                          })
                        }>
                        <PlusIcon color="#FF5A16" size={14} />
                        <Text className="text-xs font-black text-accent">
                          Add {MEAL_LABELS[mealType].toLowerCase()}
                        </Text>
                      </Pressable>
                    </MotionFade>
                  ) : null}
                </View>
                </MotionStagger>
              );
            })}
          </View>
        )}
      </AppPage>
    </ScrollbarContainer>
  );
}
