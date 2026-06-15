import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
import { useNutritionStats, type Period, type StatsTab } from '@/src/hooks/useNutritionStats';
import { useProfile } from '@/src/hooks/useProfile';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';

const MACRO_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  protein: { label: 'Protein', color: 'text-protein', bg: 'bg-protein' },
  carbs: { label: 'Carbs', color: 'text-carbs', bg: 'bg-carbs' },
  fats: { label: 'Fat', color: 'text-fats', bg: 'bg-fats' },
};

function PeriodToggle({ period, onChange }: { period: Period; onChange: (p: Period) => void }) {
  return (
    <View className="flex-row rounded-2xl bg-[#151515] p-1">
      {(['day', 'week'] as const).map((option) => (
        <Pressable
          className={`flex-1 items-center rounded-xl px-4 py-2 ${period === option ? 'bg-accent' : ''}`}
          key={option}
          onPress={() => onChange(option)}>
          <Text className={period === option ? 'font-black text-white' : 'font-bold text-white/50'}>
            {option === 'day' ? 'Day' : 'Week'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function TabBar({ tab, onChange }: { tab: StatsTab; onChange: (t: StatsTab) => void }) {
  return (
    <View className="flex-row rounded-2xl border border-white/10 bg-[#242424] p-1">
      {(['calories', 'macros'] as const).map((option) => (
        <Pressable
          className={`flex-1 items-center rounded-xl px-4 py-2 ${tab === option ? 'bg-accent' : ''}`}
          key={option}
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === option }}
          onPress={() => onChange(option)}>
          <Text className={tab === option ? 'font-black text-white' : 'font-bold text-white/50'}>
            {option === 'calories' ? 'Calories' : 'Macros'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function CalorieBar({ value, max, label }: { value: number; max: number; label: string }) {
  const barHeight = max > 0 ? Math.max(2, (value / max) * 120) : 0;

  return (
    <View className="flex-1 items-center gap-1">
      <Text className="text-[10px] font-black text-white" numberOfLines={1}>
        {Math.round(value)}
      </Text>
      <View className="h-[120px] w-full items-center justify-end">
        <View
          className="w-3/4 rounded-t-sm bg-protein"
          style={{ height: barHeight }}
        />
      </View>
      <Text className="text-[9px] font-semibold text-white/40" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function CalorieHistogram({ entries, period }: { entries: { date: string; calories: number }[]; period: Period }) {
  const days = period === 'week' ? 7 : 1;
  const dates: { date: string; calories: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const match = entries.find((e) => e.date === dateStr);
    dates.push({ date: dateStr, calories: match?.calories ?? 0 });
  }

  const max = dates.length > 0 ? Math.max(...dates.map((e) => e.calories), 1) : 1;

  return (
    <View className="flex-row items-end gap-1">
      {dates.map((entry) => {
        const dayLabel = new Date(entry.date).toLocaleDateString(undefined, {
          weekday: 'short',
        });
        return (
          <CalorieBar
            key={entry.date}
            label={dayLabel}
            max={max}
            value={entry.calories}
          />
        );
      })}
    </View>
  );
}

function SummaryCard({ label, value, goal, unit, showProgress = true }: { label: string; value: number; goal: number; unit: string; showProgress?: boolean }) {
  const pct = goal > 0 ? Math.round((value / goal) * 100) : 0;
  return (
    <View className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#232220] px-3 py-3">
      <Text className="text-[10px] font-bold text-white/45">{label}</Text>
      <Text className="mt-0.5 text-lg font-black text-white">
        {Math.round(value)}
        <Text className="text-xs font-bold text-white/40"> {unit}</Text>
      </Text>
      {showProgress ? (
        <>
          <View className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
            <View
              className="h-full rounded-full bg-accent"
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </View>
          <Text className="mt-0.5 text-[10px] font-semibold text-white/40">
            {pct}% of {Math.round(goal)} {unit} goal
          </Text>
        </>
      ) : null}
    </View>
  );
}

function MacrosSummary({ entries, targets }: { entries: { date: string; consumed: { protein: number; carbs: number; fats: number } }[]; targets: { protein: number; carbs: number; fats: number } }) {
  if (entries.length === 0) {
    return (
      <View className="items-center py-6">
        <Text className="text-sm text-white/40">No data for this period</Text>
      </View>
    );
  }

  const avgProtein = entries.reduce((s, e) => s + e.consumed.protein, 0) / entries.length;
  const avgCarbs = entries.reduce((s, e) => s + e.consumed.carbs, 0) / entries.length;
  const avgFats = entries.reduce((s, e) => s + e.consumed.fats, 0) / entries.length;

  const macros = [
    { key: 'protein', value: avgProtein, goal: targets.protein },
    { key: 'carbs', value: avgCarbs, goal: targets.carbs },
    { key: 'fats', value: avgFats, goal: targets.fats },
  ];

  return (
    <View className="gap-3">
      {macros.map((m) => {
        const meta = MACRO_LABELS[m.key];
        const pct = m.goal > 0 ? Math.round((m.value / m.goal) * 100) : 0;
        const barColor = pct > 100 ? 'bg-accent' : meta.bg;
        return (
          <View className="rounded-2xl border border-white/10 bg-[#232220] p-3.5" key={m.key}>
            <View className="flex-row items-center justify-between">
              <Text className={`text-sm font-black ${meta.color}`}>{meta.label}</Text>
              <Text className="text-sm font-black text-white">
                {m.value.toFixed(1)}g
                <Text className="text-xs font-bold text-white/40"> / {Math.round(m.goal)}g goal</Text>
              </Text>
            </View>
            <View className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
              <View
                className={`h-full rounded-full ${barColor}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function NutritionStatsScreen() {
  const router = useRouter();
  const { data, isLoading, error, period, setPeriod } = useNutritionStats();
  const { profile } = useProfile();
  const [tab, setTab] = useState<StatsTab>('calories');

  const entries = data?.entries ?? [];
  const targets = data?.targets ?? { calories: 0, protein: 0, carbs: 0, fats: 0 };

  const avgCalories = entries.length > 0
    ? entries.reduce((s, e) => s + e.consumed.calories, 0) / entries.length
    : 0;

  const totalCalories = entries.reduce((s, e) => s + e.consumed.calories, 0);
  const weeklyGoal = period === 'week' ? targets.calories * entries.length : targets.calories;
  const underGoal = Math.max(0, weeklyGoal - totalCalories);

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
            <Text className="text-xl font-black text-white">Nutrition Stats</Text>
          </View>

          <View className="mb-4 gap-3">
            <TabBar tab={tab} onChange={setTab} />
            <PeriodToggle period={period} onChange={setPeriod} />
          </View>

          {isLoading ? (
            <View className="items-center py-16">
              <LoadingSpinner />
            </View>
          ) : error ? (
            <View className="rounded-2xl border border-danger/40 bg-[#232220] p-3.5">
              <Text className="font-semibold text-danger">{error}</Text>
            </View>
          ) : tab === 'calories' ? (
            <View className="gap-4">
              <View className="rounded-3xl border border-white/10 bg-[#1C1C1C] p-4 shadow-card">
                <Text className="mb-3 text-xs font-black uppercase tracking-widest text-white/45">
                  {period === 'week' ? 'Daily calories (this week)' : 'Today'}
                </Text>
                <View className="relative">
                  <CalorieHistogram
                    entries={entries.map((e) => ({
                      date: e.date,
                      calories: e.consumed.calories,
                    }))}
                    period={period}
                  />
                </View>
              </View>

              <View className="flex-row flex-wrap gap-3">
                <SummaryCard
                  label="Daily average"
                  unit="kcal"
                  value={avgCalories}
                  goal={targets.calories}
                />
                <SummaryCard
                  label="Goal"
                  unit="kcal"
                  value={targets.calories}
                  goal={targets.calories}
                  showProgress={false}
                />
              </View>

              {period === 'week' ? (
                <View className="rounded-3xl border border-white/10 bg-[#1C1C1C] p-4 shadow-card">
                  <Text className="text-xs font-black uppercase tracking-widest text-white/45">
                    Weekly summary
                  </Text>
                  <Text className="mt-2 text-2xl font-black text-white">
                    {Math.round(totalCalories)}
                    <Text className="text-sm font-bold text-white/40"> kcal logged</Text>
                  </Text>
                  <Text className="mt-1 text-sm text-white/55">
                    {Math.round(weeklyGoal)} kcal goal ·{' '}
                    <Text className="font-bold text-protein">{Math.round(underGoal)} kcal under goal</Text>
                  </Text>
                  <View className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <View
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${Math.min((totalCalories / weeklyGoal) * 100, 100)}%` }}
                    />
                  </View>
                </View>
              ) : null}
            </View>
          ) : (
            <View className="gap-4">
              <View className="rounded-3xl border border-white/10 bg-[#1C1C1C] p-4 shadow-card">
                <Text className="mb-3 text-xs font-black uppercase tracking-widest text-white/45">
                  Average daily macros vs goal
                </Text>
                <MacrosSummary entries={entries} targets={targets} />
              </View>
            </View>
          )}
        </View>
      </ScrollbarContainer>
    </View>
  );
}
