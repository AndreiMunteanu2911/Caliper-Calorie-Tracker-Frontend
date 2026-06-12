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
  colorClass: string;
  softColorClass: string;
};

export function MacroRing({
  label,
  consumed,
  target,
  colorClass,
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
    <View className="min-w-[104px] flex-1 gap-3 rounded-3xl border border-line bg-surface p-4">
      <View className={`h-10 w-10 items-center justify-center rounded-2xl ${softColorClass}`}>
        <View className={`h-3 w-3 rounded-full ${colorClass}`} />
      </View>
      <View>
        <Text className="text-sm font-bold text-muted">{label}</Text>
        <Text className="mt-1 text-2xl font-black text-ink">
          {Math.round(consumed)}
          <Text className="text-sm font-bold text-muted">g</Text>
        </Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-line">
        <Animated.View
          className={`h-full rounded-full ${colorClass}`}
          style={progressStyle}
        />
      </View>
      <Text className="text-xs font-semibold text-muted">
        {Math.round(target - consumed) > 0
          ? `${Math.round(target - consumed)}g left`
          : 'Target reached'}
      </Text>
    </View>
  );
}
