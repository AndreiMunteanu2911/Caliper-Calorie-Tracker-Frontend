import { Motion } from '@legendapp/motion';
import { CaretDownIcon, CaretUpIcon } from 'phosphor-react-native';
import { useCallback, useEffect, useRef } from 'react';
import {
  Pressable,
  Text,
  View,
} from 'react-native';

import { motionTransition } from '@/src/lib/motion';

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
  const valueRef = useRef(roundedValue);

  useEffect(() => {
    previousValue.current = roundedValue;
    valueRef.current = roundedValue;
  }, [roundedValue]);

  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
      if (repeatInterval.current) clearInterval(repeatInterval.current);
    };
  }, []);

  function update(dir: number) {
    const current = valueRef.current;
    onChange(clamp(current + dir * step, min, max));
  }

  const stopHold = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (repeatInterval.current) {
      clearInterval(repeatInterval.current);
      repeatInterval.current = null;
    }
  }, []);

  const startHold = useCallback((dir: number) => {
    stopHold();
    update(dir);

    const initialDelay = 300;
    const initialSpeed = 120;
    const minSpeed = 40;
    const acceleration = 6;

    holdTimer.current = setTimeout(() => {
      let speed = initialSpeed;

      const doRepeat = () => {
        update(dir);
        speed = Math.max(minSpeed, speed - acceleration);
        if (repeatInterval.current) clearInterval(repeatInterval.current);
        repeatInterval.current = setInterval(doRepeat, speed);
      };

      repeatInterval.current = setInterval(doRepeat, speed);
    }, initialDelay);
  }, [stopHold]);

  return (
      <View className="min-w-24 flex-1 gap-1">
        <Text className="pl-2 text-xs font-bold text-white/70">{label}</Text>
        <View
            accessibilityActions={[
              { name: 'increment', label: `Increase ${label}` },
              { name: 'decrement', label: `Decrease ${label}` },
            ]}
            accessibilityLabel={`${label}, ${roundedValue} ${suffix}`}
            accessibilityRole="adjustable"
            className="h-24 overflow-hidden rounded-2xl border border-white/10 bg-[#141414]"
            onAccessibilityAction={(event) =>
                update(event.nativeEvent.actionName === 'increment' ? 1 : -1)
            }>
          <Pressable
              accessibilityLabel={`Increase ${label}`}
              className="h-7 w-full flex-row items-center"
              onPressIn={() => startHold(1)}
              onPressOut={stopHold}>
            <View className="flex-1" />
            <CaretUpIcon color="#FF5A16" size={13} weight="bold" />
            <View className="flex-1 items-start pl-2">
              <Text className="text-xs font-black text-accent">
                {clamp(roundedValue + step, min, max)}
              </Text>
            </View>
          </Pressable>
          <View className="relative flex-1 items-center justify-center overflow-hidden border-y border-white/5">
            <Motion.View
                animate={{ opacity: 1, y: 0 }}
                initial={
                  closing
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: direction > 0 ? 6 : -6 }
                }
                key={roundedValue}
                style={{
                  alignItems: 'center',
                  bottom: 0,
                  justifyContent: 'center',
                  left: 0,
                  position: 'absolute',
                  right: 0,
                  top: 0,
                }}
                transition={motionTransition.quick}>
              <Text className="text-lg font-black text-white">
                {roundedValue}
                <Text className="text-xs font-bold text-white/40"> {suffix}</Text>
              </Text>
            </Motion.View>
          </View>
          <Pressable
              accessibilityLabel={`Decrease ${label}`}
              className="h-7 w-full flex-row items-center"
              onPressIn={() => startHold(-1)}
              onPressOut={stopHold}>
            <View className="flex-1" />
            <CaretDownIcon color="#FF5A16" size={13} weight="bold" />
            <View className="flex-1 items-start pl-2">
              <Text className="text-xs font-black text-accent">
                {clamp(roundedValue - step, min, max)}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
  );
}
