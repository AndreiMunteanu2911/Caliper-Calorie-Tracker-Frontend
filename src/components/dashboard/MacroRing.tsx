import { useState } from 'react';
import { Text, View } from 'react-native';

import { MotionProgress } from '@/src/lib/motion';
import { shadows } from '@/src/lib/shadows';

type MacroRingProps = {
  label: string;
  consumed: number;
  target: number;
  softColorClass: string;
};

export function MacroRing({
  label,
  consumed,
  target,
  softColorClass,
}: MacroRingProps) {
  const percentage = target > 0 ? Math.min(consumed / target, 1) : 0;
  const [barWidth, setBarWidth] = useState(0);

  return (
    <View
      className={`relative min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/40 p-4 ${softColorClass}`}
      style={shadows.card}>
      <View className="absolute -right-5 -top-6 h-20 w-20 rounded-full border-8 border-white/20" />
      <View className="flex-row items-start justify-between gap-3">
        <View>
          <Text className="text-xs font-black text-brand/60">{label}</Text>
          <Text className="mt-1 text-2xl font-black tracking-tighter text-ink">
            {Math.round(consumed)}
            <Text className="text-sm font-bold text-muted">g</Text>
          </Text>
        </View>
        <View className="h-9 w-9 items-center justify-center rounded-full bg-white/70">
          <Text className="text-xs font-black text-brand">
            {Math.round(percentage * 100)}%
          </Text>
        </View>
      </View>
      <View
        className="mt-5 h-1.5 overflow-hidden rounded-full bg-brand/10"
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}>
        <View className="h-full" style={{ width: barWidth }}>
          <MotionProgress
            progress={percentage}
            style={{ backgroundColor: '#101010', borderRadius: 999 }}
          />
        </View>
      </View>
      <Text className="mt-2 text-xs font-semibold text-brand/55">
        {Math.round(target - consumed) > 0
          ? `${Math.round(target - consumed)}g left`
          : 'Target reached'}
      </Text>
    </View>
  );
}
