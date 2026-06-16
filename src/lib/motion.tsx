import { Motion } from '@legendapp/motion';
import type { PropsWithChildren, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import { Pressable, View } from 'react-native';

export const motionTransition = {
  instant: { type: 'timing' as const, duration: 80 },
  quick: { type: 'timing' as const, duration: 110 },
  standard: { type: 'timing' as const, duration: 150 },
} as const;

type MotionViewProps = PropsWithChildren<{
  className?: string;
  delay?: number;
  distance?: number;
  horizontal?: boolean;
  reverse?: boolean;
  scaleFrom?: number;
  style?: StyleProp<ViewStyle>;
}>;

export function MotionFade({
  children,
  className = '',
  delay = 0,
  distance = 6,
  horizontal = false,
  reverse = false,
  scaleFrom = 1,
  style,
}: MotionViewProps) {
  const offset = (reverse ? -1 : 1) * distance;

  return (
    <View className={className} style={style}>
      <Motion.View
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        initial={{
          opacity: 0,
          scale: scaleFrom,
          x: horizontal ? offset : 0,
          y: horizontal ? 0 : offset,
        }}
        style={{ alignSelf: 'stretch', width: '100%' }}
        transition={{ ...motionTransition.standard, delay }}>
        {children}
      </Motion.View>
    </View>
  );
}

export function MotionPage({
  children,
  fill = false,
}: PropsWithChildren<{ fill?: boolean }>) {
  return (
    <View
      style={{
        alignSelf: 'stretch',
        ...(fill ? { flex: 1, minHeight: 0 } : null),
      }}>
      <Motion.View
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 5 }}
        style={{
          alignSelf: 'stretch',
          ...(fill ? { flex: 1, minHeight: 0 } : null),
        }}
        transition={motionTransition.standard}>
        {children}
      </Motion.View>
    </View>
  );
}

type MotionPressableProps = Omit<PressableProps, 'children'> & {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  fill?: boolean;
  lift?: boolean;
  selected?: boolean;
};

export function MotionPressable({
  children,
  className = '',
  containerClassName = '',
  disabled,
  fill = false,
  lift = false,
  onPressIn,
  onPressOut,
  selected = false,
  ...props
}: MotionPressableProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <View
      className={containerClassName}
      style={fill ? { alignSelf: 'stretch' } : undefined}>
      <Motion.View
        animate={{
          scale: pressed && !disabled ? 0.975 : selected ? 1.015 : 1,
        }}
        style={{
          alignSelf: 'stretch',
          width: '100%',
          ...(fill ? { flex: 1, height: '100%' } : null),
        }}
        transition={motionTransition.quick}
        whileHover={lift && !disabled ? { scale: 1.01, y: -2 } : undefined}>
        <Pressable
          {...props}
          className={className}
          disabled={disabled}
          style={(state) => [
            fill ? { flex: 1, height: '100%' } : null,
            typeof props.style === 'function' ? props.style(state) : props.style,
          ]}
          onPressIn={(event) => {
            setPressed(true);
            onPressIn?.(event);
          }}
          onPressOut={(event) => {
            setPressed(false);
            onPressOut?.(event);
          }}>
          {children}
        </Pressable>
      </Motion.View>
    </View>
  );
}

export function MotionProgress({
  vertical = false,
  progress,
  style,
}: {
  vertical?: boolean;
  progress: number;
  style?: StyleProp<ViewStyle>;
}) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const clampedProgress = Math.max(0, Math.min(progress, 1));

  useEffect(() => {
    let animationFrame = 0;
    let startTime = 0;
    const startValue = displayProgress;
    const change = clampedProgress - startValue;

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const animationProgress = Math.min(
        elapsed / motionTransition.standard.duration,
        1,
      );
      const eased = 1 - (1 - animationProgress) ** 3;
      setDisplayProgress(startValue + change * eased);

      if (animationProgress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    }

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [clampedProgress]);

  return (
    <View
      style={[
        {
          alignSelf: vertical ? 'center' : 'flex-start',
          height: vertical ? `${displayProgress * 100}%` : '100%',
          marginTop: vertical ? 'auto' : undefined,
          width: vertical ? '100%' : `${displayProgress * 100}%`,
        } as ViewStyle,
        style,
      ]}
    />
  );
}

export function MotionStagger({
  children,
  index,
  style,
}: PropsWithChildren<{ index: number; style?: StyleProp<ViewStyle> }>) {
  return (
    <View style={[{ alignSelf: 'stretch' }, style]}>
      <MotionFade delay={Math.min(index * 35, 175)} distance={5}>
        {children}
      </MotionFade>
    </View>
  );
}

export function MotionPop({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return (
    <Motion.View
      animate={{ opacity: 1, scale: 1 }}
      initial={{ opacity: 0, scale: 0.82 }}
      style={style}
      transition={motionTransition.standard}>
      {children}
    </Motion.View>
  );
}

export function MotionSkeleton({
  className = '',
}: {
  className?: string;
}) {
  const [bright, setBright] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setBright((current) => !current), 650);
    return () => clearInterval(timer);
  }, []);

  return (
    <Motion.View
      animate={{ opacity: bright ? 0.72 : 0.34 }}
      initial={{ opacity: 0.28 }}
      style={{ alignSelf: 'stretch' }}
      transition={{ type: 'timing', duration: 520 }}>
      <View className={`rounded-2xl bg-white/10 ${className}`} />
    </Motion.View>
  );
}

export function PageSkeleton() {
  return (
    <View className="gap-3 py-6">
      <MotionSkeleton className="h-20 w-full" />
      <View className="flex-row gap-3">
        <View className="flex-1">
          <MotionSkeleton className="h-32 w-full" />
        </View>
        <View className="flex-1">
          <MotionSkeleton className="h-32 w-full" />
        </View>
      </View>
      <MotionSkeleton className="h-40 w-full" />
    </View>
  );
}
