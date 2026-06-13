import type { LucideIcon } from 'lucide-react-native';
import { Pressable, Text, type PressableProps, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';

type ButtonVariant = 'primary' | 'secondary' | 'outline';
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
  primary: 'border border-accent bg-accent shadow-glow',
  secondary: 'border border-white bg-white shadow-soft',
  outline: 'border border-accent bg-brand',
};

const TEXT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-brand',
  outline: 'text-accent',
};

const ICON_COLORS: Record<ButtonVariant, string> = {
  primary: '#FFFFFF',
  secondary: '#101010',
  outline: '#FF5A16',
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
          <View className="h-8 w-8 items-center justify-center">
            <LoadingSpinner color={ICON_COLORS[variant]} />
          </View>
        ) : (
          <>
            {Icon && iconPosition === 'left' ? (
              <Icon
                color={ICON_COLORS[variant]}
                size={18}
                strokeWidth={2.6}
              />
            ) : null}
            <Text className={`text-base font-black tracking-[-0.3px] ${TEXT_CLASSES[variant]}`}>
              {label}
            </Text>
            {Icon && iconPosition === 'right' ? (
              <Icon
                color={ICON_COLORS[variant]}
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
