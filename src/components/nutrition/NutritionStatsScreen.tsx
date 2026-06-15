import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
import {
  type Period,
  type StatsTab,
  useNutritionStats,
} from '@/src/hooks/useNutritionStats';
import { useWeightLogs } from '@/src/hooks/useWeightLogs';
import { localDateString, parseLocalDate, shiftLocalDate } from '@/src/lib/dates';
import type {
  MacroHistoryEntry,
  MacroTotals,
  WeightLogItem,
} from '@/src/types/api';

const PERIODS: { value: Period; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: '7D' },
  { value: 'month', label: '30D' },
  { value: 'quarter', label: '90D' },
];

const NUTRIENTS: {
  label: string;
  key: keyof MacroTotals;
  unit: string;
  hasGoal: boolean;
}[] = [
  { label: 'Protein', key: 'protein', unit: 'g', hasGoal: true },
  { label: 'Carbs', key: 'carbs', unit: 'g', hasGoal: true },
  { label: 'Fat', key: 'fats', unit: 'g', hasGoal: true },
  { label: 'Fiber', key: 'fiber', unit: 'g', hasGoal: false },
  { label: 'Sugar', key: 'sugar', unit: 'g', hasGoal: false },
  { label: 'Sodium', key: 'sodium_mg', unit: 'mg', hasGoal: false },
  {
    label: 'Saturated fat',
    key: 'saturated_fat',
    unit: 'g',
    hasGoal: false,
  },
];

function Toggle({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View className="flex-row rounded-2xl border border-white/10 bg-[#242424] p-1">
      {options.map((option) => (
        <Pressable
          className={`min-w-0 flex-1 items-center rounded-xl px-2 py-2 ${
            value === option.value ? 'bg-accent' : ''
          }`}
          key={option.value}
          onPress={() => onChange(option.value)}>
          <Text
            className={
              value === option.value
                ? 'font-black text-white'
                : 'font-bold text-white/50'
            }>
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function SummaryCard({
  label,
  value,
  goal,
  unit,
}: {
  label: string;
  value: number;
  goal?: number;
  unit: string;
}) {
  const percentage = goal && goal > 0 ? (value / goal) * 100 : null;
  return (
    <View className="min-w-[46%] flex-1 rounded-2xl border border-white/10 bg-[#232220] p-3">
      <Text className="text-xs font-bold text-white/45">{label}</Text>
      <Text className="mt-1 text-lg font-black text-white">
        {Math.round(value)}
        <Text className="text-xs text-white/40"> {unit}</Text>
      </Text>
      {percentage !== null ? (
        <>
          <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <View
              className="h-full rounded-full bg-accent"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </View>
          <Text className="mt-1 text-xs text-white/35">
            {Math.round(percentage)}% of goal
          </Text>
        </>
      ) : null}
    </View>
  );
}

function CalorieChart({
  entries,
  days,
}: {
  entries: MacroHistoryEntry[];
  days: number;
}) {
  const caloriesByDate = new Map(
    entries.map((entry) => [entry.date, entry.consumed.calories]),
  );
  const dailyValues = Array.from({ length: days }, (_, index) => {
    const date = shiftLocalDate(localDateString(), index - days + 1);
    return {
      date,
      calories: caloriesByDate.get(date) ?? 0,
    };
  });
  const bucketSize = days <= 7 ? 1 : days <= 30 ? 3 : 7;
  const buckets = Array.from(
    { length: Math.ceil(dailyValues.length / bucketSize) },
    (_, index) => {
      const bucketDays = dailyValues.slice(
        index * bucketSize,
        (index + 1) * bucketSize,
      );
      return {
        startDate: bucketDays[0].date,
        calories:
          bucketDays.reduce((sum, item) => sum + item.calories, 0) /
          bucketDays.length,
      };
    },
  );
  const maximum = Math.max(...buckets.map((item) => item.calories), 1);

  return (
    <View className="flex-row items-end gap-1">
      {buckets.map((item) => (
        <View
          className="min-w-0 flex-1 items-center gap-1"
          key={item.startDate}>
          <Text className="text-[9px] font-black text-white/70">
            {Math.round(item.calories)}
          </Text>
          <View className="h-28 w-full items-center justify-end">
            <View
              className={`${days === 1 ? 'w-12' : 'w-3/4'} rounded-t bg-protein`}
              style={{
                height: Math.max(2, (item.calories / maximum) * 112),
              }}
            />
          </View>
          <Text className="text-[9px] text-white/35">
            {days <= 7
              ? parseLocalDate(item.startDate).toLocaleDateString(undefined, {
                  weekday: 'narrow',
                })
              : parseLocalDate(item.startDate).toLocaleDateString(undefined, {
                  month: 'numeric',
                  day: 'numeric',
                })}
          </Text>
        </View>
      ))}
    </View>
  );
}

function average(
  entries: MacroHistoryEntry[],
  key: keyof MacroTotals,
): number {
  return entries.length
    ? entries.reduce((sum, entry) => sum + entry.consumed[key], 0) /
        entries.length
    : 0;
}

function bucketSizeLabel(days: number): string {
  return days <= 30
    ? '3-day daily averages'
    : '7-day daily averages';
}

function correlation(values: [number, number][]): number | null {
  if (values.length < 3) return null;
  const meanX = values.reduce((sum, [x]) => sum + x, 0) / values.length;
  const meanY = values.reduce((sum, [, y]) => sum + y, 0) / values.length;
  const numerator = values.reduce(
    (sum, [x, y]) => sum + (x - meanX) * (y - meanY),
    0,
  );
  const denominator = Math.sqrt(
    values.reduce((sum, [x]) => sum + (x - meanX) ** 2, 0) *
      values.reduce((sum, [, y]) => sum + (y - meanY) ** 2, 0),
  );
  return denominator > 0 ? numerator / denominator : null;
}

function nearestWeight(
  entries: WeightLogItem[],
  targetDate: string,
): WeightLogItem | null {
  const targetTime = parseLocalDate(targetDate).getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  let nearest: WeightLogItem | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  entries.forEach((entry) => {
    const distance = Math.abs(
      parseLocalDate(entry.recorded_on).getTime() - targetTime,
    );
    if (distance <= dayMs && distance < nearestDistance) {
      nearest = entry;
      nearestDistance = distance;
    }
  });

  return nearest;
}

function calorieWeightTrend(
  calorieEntries: MacroHistoryEntry[],
  weightEntries: WeightLogItem[],
): { correlation: number | null; samples: number } {
  const caloriesByDate = new Map(
    calorieEntries.map((entry) => [entry.date, entry.consumed.calories]),
  );
  const today = localDateString();
  const values: [number, number][] = [];
  const usedWeightPairs = new Set<string>();

  calorieEntries.forEach((entry) => {
    const intakeWindow = Array.from({ length: 7 }, (_, index) =>
      shiftLocalDate(entry.date, index - 6),
    );
    const calories = intakeWindow.map((date) => caloriesByDate.get(date) ?? 0);
    const loggedDays = calories.filter((value) => value > 0).length;
    const followUpDate = shiftLocalDate(entry.date, 7);

    if (loggedDays < 5 || followUpDate > today) return;

    const startingWeight = nearestWeight(weightEntries, entry.date);
    const followUpWeight = nearestWeight(weightEntries, followUpDate);
    if (
      !startingWeight ||
      !followUpWeight ||
      startingWeight.id === followUpWeight.id
    ) {
      return;
    }
    const pairKey = `${startingWeight.id}:${followUpWeight.id}`;
    if (usedWeightPairs.has(pairKey)) return;
    usedWeightPairs.add(pairKey);

    const averageCalories =
      calories.reduce((sum, value) => sum + value, 0) / calories.length;
    values.push([
      averageCalories,
      followUpWeight.weight_kg - startingWeight.weight_kg,
    ]);
  });

  return {
    correlation: correlation(values),
    samples: values.length,
  };
}

export function NutritionStatsScreen() {
  const router = useRouter();
  const { data, isLoading, error, period, setPeriod } = useNutritionStats();
  const { data: weightData } = useWeightLogs();
  const [tab, setTab] = useState<StatsTab>('calories');
  const entries = data?.entries ?? [];
  const targets = data?.targets;
  const days = data?.days ?? 1;

  const totalCalories = entries.reduce(
    (sum, entry) => sum + entry.consumed.calories,
    0,
  );
  const periodGoal = (targets?.calories ?? 0) * days;
  const difference = periodGoal - totalCalories;
  const calorieAdherence =
    targets && days
      ? (entries.filter(
          (entry) =>
            Math.abs(entry.consumed.calories - targets.calories) /
              targets.calories <=
            0.1,
        ).length /
          days) *
        100
      : 0;
  const proteinConsistency =
    targets && days
      ? (entries.filter(
          (entry) => entry.consumed.protein >= targets.protein * 0.9,
        ).length /
          days) *
        100
      : 0;
  const weightTrend = calorieWeightTrend(
    entries,
    weightData?.entries ?? [],
  );

  return (
    <View className="flex-1 bg-brand">
      <ScrollbarContainer
        className="flex-1"
        contentContainerClassName="px-4 pb-20 pt-4 sm:px-6">
        <View className="w-full max-w-lg self-center">
          <View className="mb-4 flex-row items-center gap-3">
            <Pressable
              accessibilityLabel="Go back"
              className="h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#232323]"
              onPress={() => router.back()}>
              <ChevronLeft color="#FFFFFF" size={20} />
            </Pressable>
            <Text className="text-xl font-black text-white">Nutrition stats</Text>
          </View>

          <View className="mb-4 gap-3">
            <Toggle
              options={[
                { value: 'calories', label: 'Calories' },
                { value: 'macros', label: 'Nutrients' },
              ]}
              value={tab}
              onChange={(value) => setTab(value as StatsTab)}
            />
            <Toggle
              options={PERIODS}
              value={period}
              onChange={(value) => setPeriod(value as Period)}
            />
          </View>

          {isLoading ? (
            <View className="items-center py-16">
              <LoadingSpinner />
            </View>
          ) : error || !targets ? (
            <View className="rounded-2xl bg-dangerSoft p-4">
              <Text className="font-semibold text-danger">
                {error ?? 'Nutrition stats are unavailable.'}
              </Text>
            </View>
          ) : tab === 'calories' ? (
            <View className="gap-4">
              <View className="rounded-3xl border border-white/10 bg-[#1C1C1C] p-4">
                <Text className="mb-3 text-xs font-black uppercase tracking-widest text-white/45">
                  {days === 1
                    ? 'Today'
                    : days === 7
                      ? 'Daily calories, last 7 days'
                      : `Last ${days} days, ${bucketSizeLabel(days)}`}
                </Text>
                <CalorieChart entries={entries} days={days} />
              </View>
              <View className="flex-row flex-wrap gap-3">
                <SummaryCard
                  label="Daily average"
                  value={average(entries, 'calories')}
                  goal={targets.calories}
                  unit="kcal"
                />
                <SummaryCard
                  label="Period total"
                  value={totalCalories}
                  goal={periodGoal}
                  unit="kcal"
                />
                <SummaryCard
                  label="Calorie adherence"
                  value={calorieAdherence}
                  goal={100}
                  unit="%"
                />
                <SummaryCard
                  label="Protein consistency"
                  value={proteinConsistency}
                  goal={100}
                  unit="%"
                />
              </View>
              <View className="rounded-2xl border border-white/10 bg-[#232220] p-4">
                <Text className="font-black text-white">
                  {Math.abs(Math.round(difference))} kcal{' '}
                  {difference >= 0 ? 'under' : 'over'} period goal
                </Text>
                <Text className="mt-1 text-sm text-white/45">
                  Missing logging days count as incomplete days, not successful
                  adherence.
                </Text>
              </View>
              <View className="rounded-2xl border border-white/10 bg-[#232220] p-4">
                <Text className="text-xs font-black uppercase tracking-widest text-white/45">
                  Calories vs next-week weight change
                </Text>
                <Text className="mt-2 text-lg font-black text-white">
                  {weightTrend.correlation === null
                    ? days < 30
                      ? 'Select 30D or 90D for this trend'
                      : 'More weekly weigh-ins needed'
                    : `${weightTrend.correlation >= 0 ? '+' : ''}${weightTrend.correlation.toFixed(2)} correlation`}
                </Text>
                <Text className="mt-1 text-xs leading-5 text-white/40">
                  Compares each 7-day calorie average with weight change over
                  the following week. Requires 5 logged days and weigh-ins near
                  both endpoints. {weightTrend.samples} matching samples.
                </Text>
              </View>
            </View>
          ) : (
            <View className="gap-4">
              <View className="flex-row flex-wrap gap-3">
                {NUTRIENTS.map(({ label, key, unit, hasGoal }) => (
                  <SummaryCard
                    key={key}
                    label={`Average ${label.toLowerCase()}`}
                    value={average(entries, key)}
                    goal={hasGoal ? targets[key] : undefined}
                    unit={unit}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollbarContainer>
    </View>
  );
}
