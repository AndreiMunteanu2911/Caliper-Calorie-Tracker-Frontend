import type { PropsWithChildren } from 'react';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';

type AnimatedPresenceProps = PropsWithChildren<{
  className?: string;
}>;

export function AnimatedPresence({
  children,
  className,
}: AnimatedPresenceProps) {
  return (
    <Animated.View
      className={className}
      entering={FadeIn.duration(160)}
      exiting={FadeOut.duration(110)}
      layout={LinearTransition.duration(160)}>
      {children}
    </Animated.View>
  );
}
