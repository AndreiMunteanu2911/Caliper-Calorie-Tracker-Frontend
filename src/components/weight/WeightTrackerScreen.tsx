import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { AnimatedPresence } from '@/src/components/ui/AnimatedPresence';
import { Button } from '@/src/components/ui/Button';
import { InputBox } from '@/src/components/ui/InputBox';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
import { useWeightLogs } from '@/src/hooks/useWeightLogs';
import type { WeightLogItem } from '@/src/types/api';

function localDateValue(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function isValidDateValue(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function WeightChart({ entries }: { entries: WeightLogItem[] }) {
  const width = 320;
  const height = 150;
  const padding = 18;
  const points = useMemo(() => {
    if (entries.length === 0) return [];
    const values = entries.map((entry) => entry.weight_kg);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = Math.max(max - min, 1);
    return entries.map((entry, index) => ({
      x:
        entries.length === 1
          ? width / 2
          : padding + (index / (entries.length - 1)) * (width - padding * 2),
      y:
        height -
        padding -
        ((entry.weight_kg - min) / range) * (height - padding * 2),
    }));
  }, [entries]);

  if (points.length === 0) {
    return (
      <View className="h-40 items-center justify-center">
        <Text className="text-sm text-white/40">Add a weight to start the chart.</Text>
      </View>
    );
  }

  return (
    <View className="items-center overflow-hidden rounded-2xl bg-[#181818] py-3">
      <Svg height={height} viewBox={`0 0 ${width} ${height}`} width="100%">
        {[0.25, 0.5, 0.75].map((ratio) => (
          <Line
            key={ratio}
            x1={padding}
            x2={width - padding}
            y1={height * ratio}
            y2={height * ratio}
            stroke="#FFFFFF"
            strokeOpacity={0.08}
          />
        ))}
        <Polyline
          fill="none"
          points={points.map((point) => `${point.x},${point.y}`).join(' ')}
          stroke="#FF5A16"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
        />
        {points.map((point, index) => (
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
                  <InputBox
                    accessibilityLabel="Recorded date"
                    compact
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#777777"
                    value={date}
                    onChangeText={setDate}
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
