import type { PropsWithChildren } from 'react';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';

type AnimatedPresenceProps = PropsWithChildren<{
  className?: string;
  animateLayout?: boolean;
}>;

export function AnimatedPresence({
  children,
  className,
  animateLayout = true,
}: AnimatedPresenceProps) {
  return (
    <Animated.View
      className={className}
      entering={FadeIn.duration(160)}
      exiting={FadeOut.duration(110)}
      layout={animateLayout ? LinearTransition.duration(160) : undefined}>
      {children}
    </Animated.View>
  );
}
