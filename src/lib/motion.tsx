import { Motion } from '@legendapp/motion';
import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';

export const motionTransition = {
  quick: { type: 'timing' as const, duration: 110 },
  standard: { type: 'timing' as const, duration: 150 },
} as const;

type MotionViewProps = PropsWithChildren<{
  className?: string;
  delay?: number;
  distance?: number;
  horizontal?: boolean;
  reverse?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

export function MotionFade({
  children,
  className = '',
  delay = 0,
  distance = 6,
  horizontal = false,
  reverse = false,
  style,
}: MotionViewProps) {
  const offset = (reverse ? -1 : 1) * distance;

  return (
    <Motion.View
      animate={{ opacity: 1, x: 0, y: 0 }}
      initial={{
        opacity: 0,
        x: horizontal ? offset : 0,
        y: horizontal ? 0 : offset,
      }}
      style={[{ alignSelf: 'stretch' }, style]}
      transition={{ ...motionTransition.standard, delay }}>
      <View className={className}>{children}</View>
    </Motion.View>
  );
}
