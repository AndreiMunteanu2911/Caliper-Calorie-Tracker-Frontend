import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import {
  Pressable,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
} from 'react-native-reanimated';

type NumberSpinnerProps = {
  label: string;
  suffix: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  closing?: boolean;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function NumberSpinner({
                                label,
                                suffix,
                                value,
                                onChange,
                                min = 0,
                                max = 1000,
                                step = 1,
                                closing = false,
                              }: NumberSpinnerProps) {
  const roundedValue = Math.round(value / step) * step;
  const previousValue = useRef(roundedValue);
  const direction = roundedValue >= previousValue.current ? 1 : -1;

  useEffect(() => {
    previousValue.current = roundedValue;
  }, [roundedValue]);

  function update(dir: number) {
    onChange(clamp(roundedValue + dir * step, min, max));
  }

  return (
      <View className="min-w-[104px] flex-1 gap-1.5">
        <Text className="pl-2 text-sm font-bold text-white/70">{label}</Text>
        <View
            accessibilityActions={[
              { name: 'increment', label: `Increase ${label}` },
              { name: 'decrement', label: `Decrease ${label}` },
            ]}
            accessibilityLabel={`${label}, ${roundedValue} ${suffix}`}
            accessibilityRole="adjustable"
            className="h-28 overflow-hidden rounded-[20px] border border-white/10 bg-[#141414]"
            onAccessibilityAction={(event) =>
                update(event.nativeEvent.actionName === 'increment' ? 1 : -1)
            }>
          <Pressable
              accessibilityLabel={`Increase ${label}`}
              className="h-8 w-full flex-row items-center"
              onPress={() => update(1)}>
            <View className="flex-1" />
            <ChevronUp color="#FF5A16" size={15} />
            <View className="flex-1 items-start pl-2">
              <Text className="text-[11px] font-black text-accent">
                {clamp(roundedValue + step, min, max)}
              </Text>
            </View>
          </Pressable>
          <View className="relative flex-1 items-center justify-center overflow-hidden border-y border-white/5">
            <Animated.View
                className="absolute h-full w-full items-center justify-center"
                entering={
                  direction > 0
                      ? FadeInUp.duration(150)
                      : FadeInDown.duration(150)
                }
                exiting={
                  closing
                      ? undefined
                      : direction > 0
                          ? FadeOutUp.duration(150)
                          : FadeOutDown.duration(150)
                }
                key={roundedValue}>
              <Text className="text-xl font-black text-white">
                {roundedValue}
                <Text className="text-xs font-bold text-white/40"> {suffix}</Text>
              </Text>
            </Animated.View>
          </View>
          <Pressable
              accessibilityLabel={`Decrease ${label}`}
              className="h-8 w-full flex-row items-center"
              onPress={() => update(-1)}>
            <View className="flex-1" />
            <ChevronDown color="#FF5A16" size={15} />
            <View className="flex-1 items-start pl-2">
              <Text className="text-[11px] font-black text-accent">
                {clamp(roundedValue - step, min, max)}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
  );
}