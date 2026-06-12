import { Pressable, Text, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'default' | 'compact';

type ButtonProps = Omit<PressableProps, 'children' | 'disabled'> & {
  label: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CONTAINER_CLASSES: Record<ButtonVariant, string> = {
  primary: 'border border-brand bg-brand',
  secondary: 'border border-line bg-surface',
  ghost: 'border border-transparent bg-transparent',
  danger: 'border border-danger/20 bg-dangerSoft',
};

const TEXT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-brand',
  ghost: 'text-brand',
  danger: 'text-danger',
};

export function Button({
  label,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'default',
  onPressIn,
  onPressOut,
  ...pressableProps
}: ButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      {...pressableProps}
      accessibilityLabel={pressableProps.accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={`${CONTAINER_CLASSES[variant]} items-center justify-center rounded-2xl px-5 ${
        size === 'compact' ? 'min-h-11' : 'min-h-14'
      } ${isDisabled ? 'opacity-40' : ''}`}
      disabled={isDisabled}
      onPressIn={(event) => {
        scale.value = withTiming(0.985, { duration: 80 });
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withTiming(1, { duration: 110 });
        onPressOut?.(event);
      }}
      style={animatedStyle}>
      {loading ? (
        <LoadingSpinner color={variant === 'primary' ? 'accent' : 'brand'} />
      ) : (
        <Text className={`text-base font-black ${TEXT_CLASSES[variant]}`}>
          {label}
        </Text>
      )}
    </AnimatedPressable>
  );
}
