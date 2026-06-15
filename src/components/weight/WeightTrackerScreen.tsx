import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react-native';
import { Fragment, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, {
  Circle,
  Line,
  Polyline,
  Text as SvgText,
} from 'react-native-svg';
import Animated from 'react-native-reanimated';

import { Button } from '@/src/components/ui/Button';
import { CalendarPicker } from '@/src/components/ui/CalendarPicker';
import { InputBox } from '@/src/components/ui/InputBox';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
import { useWeightLogs } from '@/src/hooks/useWeightLogs';
import { useProfile } from '@/src/hooks/useProfile';
import { motion } from '@/src/lib/motion';
import type { WeightLogItem } from '@/src/types/api';
import {
  isLocalDateString,
  localDateString,
  parseLocalDate,
} from '@/src/lib/dates';

function localDateValue(): string {
  return localDateString();
}

function isValidDateValue(value: string): boolean {
  return isLocalDateString(value);
}

function dayDifference(left: string, right: string): number {
  return (
    (parseLocalDate(left).getTime() - parseLocalDate(right).getTime()) /
    86_400_000
  );
}

function smoothedWeights(entries: WeightLogItem[]) {
  return entries.map((entry, index) => {
    const window = entries.slice(0, index + 1).filter((candidate) => {
      const age = dayDifference(entry.recorded_on, candidate.recorded_on);
      return age >= 0 && age <= 6;
    });
    const weighted = window.map((candidate) => {
      const age = dayDifference(entry.recorded_on, candidate.recorded_on);
      return {
        weight: candidate.weight_kg,
        factor: 7 - age,
      };
    });
    const totalFactor = weighted.reduce((sum, item) => sum + item.factor, 0);
    return {
      ...entry,
      smoothed_weight_kg:
        weighted.reduce(
          (sum, item) => sum + item.weight * item.factor,
          0,
        ) / totalFactor,
    };
  });
}

function weightProjection(
  entries: WeightLogItem[],
  targetWeight: number | null | undefined,
) {
  if (!targetWeight || entries.length < 4) return null;
  const recentCutoff = localDateString(
    new Date(
      parseLocalDate(entries[entries.length - 1].recorded_on).getTime() -
        55 * 86_400_000,
    ),
  );
  const smoothed = smoothedWeights(entries).filter(
    (entry) => entry.recorded_on >= recentCutoff,
  );
  if (smoothed.length < 4) return null;

  const firstDate = smoothed[0].recorded_on;
  const elapsedDays = dayDifference(
    smoothed[smoothed.length - 1].recorded_on,
    firstDate,
  );
  if (elapsedDays < 14) return null;

  const points = smoothed.map((entry) => ({
    x: dayDifference(entry.recorded_on, firstDate),
    y: entry.smoothed_weight_kg,
  }));
  const meanX = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  const meanY = points.reduce((sum, point) => sum + point.y, 0) / points.length;
  const denominator = points.reduce(
    (sum, point) => sum + (point.x - meanX) ** 2,
    0,
  );
  if (denominator === 0) return null;

  const dailyChange =
    points.reduce(
      (sum, point) => sum + (point.x - meanX) * (point.y - meanY),
      0,
    ) / denominator;
  const weeklyChange = dailyChange * 7;
  const currentWeight = smoothed[smoothed.length - 1].smoothed_weight_kg;
  const distance = targetWeight - currentWeight;
  const movingTowardTarget =
    Math.abs(distance) < 0.1 ||
    (distance < 0 && dailyChange < 0) ||
    (distance > 0 && dailyChange > 0);
  const residuals = points.map(
    (point) => point.y - (meanY + dailyChange * (point.x - meanX)),
  );
  const variability = Math.sqrt(
    residuals.reduce((sum, value) => sum + value ** 2, 0) /
      residuals.length,
  );
  const confidence =
    smoothed.length >= 8 && elapsedDays >= 28 && variability <= 0.5
      ? 'high'
      : smoothed.length >= 5 && variability <= 0.8
        ? 'moderate'
        : 'low';

  if (Math.abs(distance) < 0.1) {
    return { status: 'reached' as const, weeklyChange, confidence };
  }
  if (Math.abs(weeklyChange) < 0.05) {
    return { status: 'maintaining' as const, weeklyChange, confidence };
  }
  if (!movingTowardTarget || Math.abs(weeklyChange) > 2) {
    return { status: 'away' as const, weeklyChange, confidence };
  }

  const daysRemaining = distance / dailyChange;
  if (
    !Number.isFinite(daysRemaining) ||
    daysRemaining <= 0 ||
    daysRemaining > 730
  ) {
    return { status: 'unreliable' as const, weeklyChange, confidence };
  }
  const projectedDate = parseLocalDate(
    smoothed[smoothed.length - 1].recorded_on,
  );
  projectedDate.setDate(projectedDate.getDate() + Math.ceil(daysRemaining));
  return {
    status: 'projected' as const,
    weeklyChange,
    confidence,
    projectedDate,
  };
}

function WeightChart({
  entries,
  isLoading,
}: {
  entries: WeightLogItem[];
  isLoading: boolean;
}) {
  const width = 360;
  const height = 210;
  const left = 45;
  const right = 12;
  const top = 14;
  const bottom = 34;
  const chart = useMemo(() => {
    if (entries.length === 0) {
      return { points: [], yTicks: [], xLabels: [] };
    }
    const values = smoothedWeights(entries).map(
      (entry) => entry.smoothed_weight_kg,
    );
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const rawRange = Math.max(rawMax - rawMin, 1);
    const domainPadding = Math.max(rawRange * 0.15, 0.5);
    const domainMin = Math.floor((rawMin - domainPadding) * 2) / 2;
    const domainMax = Math.ceil((rawMax + domainPadding) * 2) / 2;
    const range = domainMax - domainMin;
    const points = entries.map((entry, index) => ({
      x:
        entries.length === 1
          ? (left + width - right) / 2
          : left +
            (index / (entries.length - 1)) * (width - left - right),
      y:
        height -
        bottom -
        ((values[index] - domainMin) / range) *
          (height - top - bottom),
    }));
    const yTicks = Array.from({ length: 5 }, (_, index) => {
      const ratio = index / 4;
      return {
        value: domainMax - range * ratio,
        y: top + ratio * (height - top - bottom),
      };
    });
    const labelIndexes = Array.from(
      new Set([
        0,
        Math.round((entries.length - 1) / 2),
        entries.length - 1,
      ]),
    );
    const xLabels = labelIndexes.map((index) => ({
      x: points[index].x,
      label: new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
      }).format(parseLocalDate(entries[index].recorded_on)),
    }));
    return { points, yTicks, xLabels };
  }, [entries]);

  if (chart.points.length === 0) {
    return (
      <View className="h-[234px] items-center justify-center overflow-hidden rounded-2xl bg-[#181818]">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <Text className="text-sm text-white/40">
            Add a weight to start the chart.
          </Text>
        )}
      </View>
    );
  }

  return (
    <View className="h-[234px] items-center overflow-hidden rounded-2xl bg-[#181818] py-3">
      <Svg height={height} viewBox={`0 0 ${width} ${height}`} width="100%">
        {chart.yTicks.map((tick) => (
          <Fragment key={tick.value}>
            <Line
              x1={left}
              x2={width - right}
              y1={tick.y}
              y2={tick.y}
              stroke="#FFFFFF"
              strokeOpacity={0.08}
            />
            <SvgText
              fill="#8A8A8A"
              fontSize={9}
              textAnchor="end"
              x={left - 7}
              y={tick.y + 3}>
              {tick.value.toFixed(1)}
            </SvgText>
          </Fragment>
        ))}
        <SvgText fill="#8A8A8A" fontSize={9} x={4} y={10}>
          kg
        </SvgText>
        <Polyline
          fill="none"
          points={chart.points.map((point) => `${point.x},${point.y}`).join(' ')}
          stroke="#FF5A16"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
        />
        {chart.points.map((point, index) => (
          <Circle
            cx={point.x}
            cy={point.y}
            fill="#101010"
            key={entries[index].id}
            r={4}
            stroke="#FF5A16"
            strokeWidth={2}
          />
        ))}
        {chart.xLabels.map((label) => (
          <SvgText
            fill="#8A8A8A"
            fontSize={9}
            key={`${label.x}-${label.label}`}
            textAnchor="middle"
            x={label.x}
            y={height - 10}>
            {label.label}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

export function WeightTrackerScreen() {
  const router = useRouter();
  const { data, isLoading, isSaving, error, save, remove } = useWeightLogs();
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(localDateValue);
  const entries = data?.entries ?? [];
  const weightValue = Number(weight.replace(',', '.'));
  const isValid =
    weightValue >= 20 && weightValue <= 500 && isValidDateValue(date);
  const recentEntries = entries.slice(-12);
  const change = data?.change_kg;
  const TrendIcon = (change ?? 0) <= 0 ? TrendingDown : TrendingUp;
  const { profile } = useProfile();
  const projection = useMemo(
    () => weightProjection(entries, profile?.target_weight_kg),
    [entries, profile?.target_weight_kg],
  );

  async function submit() {
    const didSave = await save({ weight_kg: weightValue, recorded_on: date });
    if (didSave) setWeight('');
  }

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
            <View>
              <Text className="text-xl font-black text-white">Weight tracker</Text>
              <Text className="text-sm text-white/45">Log consistently to see the trend.</Text>
            </View>
          </View>

          <View className="gap-4">
            <Animated.View
              className="rounded-3xl border border-white/10 bg-[#232220] p-4"
              entering={motion.soft}>
              <View className="flex-row items-end justify-between">
                <View>
                  <Text className="text-xs font-black uppercase tracking-widest text-white/40">
                    Latest
                  </Text>
                  <Text className="mt-1 text-3xl font-black text-white">
                    {data?.latest_weight_kg?.toFixed(1) ?? '--'}
                    <Text className="text-sm text-white/40"> kg</Text>
                  </Text>
                </View>
                {change !== null && change !== undefined ? (
                  <View className="flex-row items-center gap-1 rounded-full bg-white/5 px-3 py-2">
                    <TrendIcon
                      color={change <= 0 ? '#45C588' : '#FF5A16'}
                      size={16}
                    />
                    <Text className="font-black text-white">
                      {change > 0 ? '+' : ''}
                      {change.toFixed(1)} kg
                    </Text>
                  </View>
                ) : null}
              </View>
              <View className="mt-4">
                <WeightChart entries={recentEntries} isLoading={isLoading} />
              </View>
              <Text className="mt-2 text-xs text-white/40">
                Trend line uses a time-weighted seven-day average.
              </Text>
              {projection ? (
                <View className="mt-2">
                  <Text className="text-sm font-bold text-protein">
                    {projection.status === 'projected'
                      ? `Current trend reaches your target around ${projection.projectedDate.toLocaleDateString()}.`
                      : projection.status === 'reached'
                        ? 'Your smoothed trend is at your target.'
                        : projection.status === 'maintaining'
                          ? 'Your recent trend is maintaining your current weight.'
                          : projection.status === 'away'
                            ? 'Your recent trend is moving away from your target.'
                            : 'Your recent trend is not stable enough for a target date.'}
                  </Text>
                  <Text className="mt-1 text-xs text-white/40">
                    {projection.weeklyChange > 0 ? '+' : ''}
                    {projection.weeklyChange.toFixed(2)} kg/week ·{' '}
                    {projection.confidence} confidence
                  </Text>
                </View>
              ) : profile?.target_weight_kg ? (
                <Text className="mt-2 text-xs leading-5 text-white/40">
                  Add at least four weigh-ins across two weeks to estimate a
                  target date.
                </Text>
              ) : null}
            </Animated.View>

            <View className="rounded-3xl border border-white/10 bg-[#232220] p-4">
              <Text className="text-base font-black text-white">Log weight</Text>
              <View className="mt-3 flex-row gap-2">
                <View className="min-w-0 flex-1">
                  <InputBox
                    accessibilityLabel="Weight in kilograms"
                    compact
                    keyboardType="decimal-pad"
                    placeholder="Weight kg"
                    placeholderTextColor="#777777"
                    value={weight}
                    onChangeText={setWeight}
                  />
                </View>
                <View className="min-w-0 flex-1">
                  <CalendarPicker
                    label="Recorded date"
                    value={date}
                    onChange={setDate}
                  />
                </View>
              </View>
              <View className="mt-3">
                <Button
                  disabled={!isValid}
                  label="Save weight"
                  loading={isSaving}
                  onPress={() => void submit()}
                />
              </View>
            </View>

            {error ? (
              <Animated.View
                className="rounded-2xl bg-dangerSoft p-3.5"
                entering={motion.enter}
                exiting={motion.exit}
                layout={motion.layout}>
                <Text className="font-semibold text-danger">{error}</Text>
              </Animated.View>
            ) : null}

            <View className="rounded-3xl border border-white/10 bg-[#232220] p-4">
              <Text className="text-base font-black text-white">History</Text>
              {isLoading && entries.length === 0 ? (
                <View className="items-center py-8">
                  <LoadingSpinner />
                </View>
              ) : entries.length === 0 ? (
                <Text className="py-6 text-center text-sm text-white/40">
                  No weight entries yet.
                </Text>
              ) : (
                <View className="mt-2">
                  {[...entries].reverse().map((entry) => (
                    <View
                      className="flex-row items-center border-b border-white/5 py-3 last:border-b-0"
                      key={entry.id}>
                      <View className="flex-1">
                        <Text className="font-black text-white">
                          {entry.weight_kg.toFixed(1)} kg
                        </Text>
                        <Text className="text-xs text-white/40">{entry.recorded_on}</Text>
                      </View>
                      <Pressable
                        accessibilityLabel={`Delete weight from ${entry.recorded_on}`}
                        className="h-9 w-9 items-center justify-center rounded-full bg-white/5"
                        onPress={() => void remove(entry.id)}>
                        <Trash2 color="#C64035" size={16} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollbarContainer>
    </View>
  );
}
