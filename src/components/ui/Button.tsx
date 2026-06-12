import type { LucideIcon } from 'lucide-react-native';
import { Pressable, Text, type PressableProps, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';

type ButtonVariant =
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'dark'
  | 'ghost'
  | 'danger';
type ButtonSize = 'default' | 'compact';

type ButtonProps = Omit<PressableProps, 'children' | 'disabled'> & {
  label: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
};

const CONTAINER_CLASSES: Record<ButtonVariant, string> = {
  primary: 'border border-white/20 bg-accent shadow-glow',
  accent: 'border border-white/40 bg-carbs shadow-soft',
  secondary: 'border border-line bg-surface shadow-soft',
  dark: 'border border-white/10 bg-white/5',
  ghost: 'border border-transparent bg-transparent',
  danger: 'border border-danger/20 bg-dangerSoft',
};

const TEXT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'text-white',
  accent: 'text-brand',
  secondary: 'text-brand',
  dark: 'text-white',
  ghost: 'text-brand',
  danger: 'text-danger',
};

export function Button({
  label,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'default',
  icon: Icon,
  iconPosition = 'right',
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
    <Animated.View style={animatedStyle}>
      <Pressable
        {...pressableProps}
        accessibilityLabel={pressableProps.accessibilityLabel ?? label}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        className={`${CONTAINER_CLASSES[variant]} flex-row items-center justify-center gap-2 rounded-2xl px-6 shadow-soft ${
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
        }}>
        {loading ? (
          <View className="h-8 w-8 items-center justify-center rounded-full bg-white">
            <LoadingSpinner />
          </View>
        ) : (
          <>
            {Icon && iconPosition === 'left' ? (
              <Icon
                color={
                  variant === 'primary' || variant === 'dark'
                    ? '#FFFFFF'
                    : variant === 'danger'
                      ? '#C64035'
                      : '#101010'
                }
                size={18}
                strokeWidth={2.6}
              />
            ) : null}
            <Text className={`text-base font-black tracking-[-0.3px] ${TEXT_CLASSES[variant]}`}>
              {label}
            </Text>
            {Icon && iconPosition === 'right' ? (
              <Icon
                color={
                  variant === 'primary' || variant === 'dark'
                    ? '#FFFFFF'
                    : variant === 'danger'
                      ? '#C64035'
                      : '#101010'
                }
                size={18}
                strokeWidth={2.6}
              />
            ) : null}
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}
