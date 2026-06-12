import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

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
  const progress = useSharedValue(0);
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  useEffect(() => {
    progress.value = withTiming(percentage, { duration: 240 });
  }, [percentage, progress]);

  return (
    <View className={`relative min-w-0 flex-1 overflow-hidden rounded-[28px] border border-white/40 p-5 shadow-card ${softColorClass}`}>
      <View className="absolute -right-7 -top-8 h-24 w-24 rounded-full border-[16px] border-white/20" />
      <View className="flex-row items-start justify-between gap-4">
        <View>
          <Text className="text-sm font-black text-brand/60">{label}</Text>
          <Text className="mt-2 text-3xl font-black tracking-[-1.8px] text-ink">
            {Math.round(consumed)}
            <Text className="text-sm font-bold text-muted">g</Text>
          </Text>
        </View>
        <View className="h-10 w-10 items-center justify-center rounded-full bg-white/70">
          <Text className="text-xs font-black text-brand">
            {Math.round(percentage * 100)}%
          </Text>
        </View>
      </View>
      <View className="mt-7 h-2 overflow-hidden rounded-full bg-brand/10">
        <Animated.View
          className="h-full rounded-full bg-brand"
          style={progressStyle}
        />
      </View>
      <Text className="mt-3 text-xs font-semibold text-brand/55">
        {Math.round(target - consumed) > 0
          ? `${Math.round(target - consumed)}g left`
          : 'Target reached'}
      </Text>
    </View>
  );
}
