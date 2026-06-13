import type { PropsWithChildren } from 'react';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';

type AnimatedPresenceProps = PropsWithChildren<{
  className?: string;
  animateLayout?: boolean;
  animateVisibility?: boolean;
}>;

export function AnimatedPresence({
  children,
  className,
  animateLayout = true,
  animateVisibility = true,
}: AnimatedPresenceProps) {
  return (
    <Animated.View
      className={className}
      entering={animateVisibility ? FadeIn.duration(160) : undefined}
      exiting={animateVisibility ? FadeOut.duration(110) : undefined}
      layout={animateLayout ? LinearTransition.duration(160) : undefined}>
      {children}
    </Animated.View>
  );
}
