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

import { AnimatedPresence } from '@/src/components/ui/AnimatedPresence';
import { Button } from '@/src/components/ui/Button';
import { CalendarPicker } from '@/src/components/ui/CalendarPicker';
import { InputBox } from '@/src/components/ui/InputBox';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
import { useWeightLogs } from '@/src/hooks/useWeightLogs';
import { useProfile } from '@/src/hooks/useProfile';
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

function WeightChart({ entries }: { entries: WeightLogItem[] }) {
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
    const values = entries.map((_, index) => {
      const window = entries.slice(Math.max(0, index - 2), index + 1);
      return window.reduce((sum, item) => sum + item.weight_kg, 0) / window.length;
    });
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
      <View className="h-40 items-center justify-center">
        <Text className="text-sm text-white/40">Add a weight to start the chart.</Text>
      </View>
    );
  }

  return (
    <View className="items-center overflow-hidden rounded-2xl bg-[#181818] py-3">
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
  const projection = useMemo(() => {
    const target = profile?.target_weight_kg;
    if (!target || entries.length < 2) return null;
    const first = entries[0];
    const last = entries[entries.length - 1];
    const elapsedDays = Math.max(
      1,
      (new Date(last.recorded_on).getTime() -
        new Date(first.recorded_on).getTime()) /
        86_400_000,
    );
    const dailyChange = (last.weight_kg - first.weight_kg) / elapsedDays;
    const daysRemaining = (target - last.weight_kg) / dailyChange;
    if (!Number.isFinite(daysRemaining) || daysRemaining <= 0) return null;
    const result = new Date();
    result.setDate(result.getDate() + Math.ceil(daysRemaining));
    return result;
  }, [entries, profile?.target_weight_kg]);

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
            <AnimatedPresence className="rounded-3xl border border-white/10 bg-[#232220] p-4">
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
                <WeightChart entries={recentEntries} />
              </View>
              <Text className="mt-2 text-xs text-white/40">
                Trend line uses a rolling three-entry average.
              </Text>
              {projection ? (
                <Text className="mt-2 text-sm font-bold text-protein">
                  Current trend reaches your target around{' '}
                  {projection.toLocaleDateString()}.
                </Text>
              ) : null}
            </AnimatedPresence>

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
              <AnimatedPresence className="rounded-2xl bg-dangerSoft p-3.5">
                <Text className="font-semibold text-danger">{error}</Text>
              </AnimatedPresence>
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
