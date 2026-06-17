import { Motion } from '@legendapp/motion';
import type { Icon } from 'phosphor-react-native';
import { useState } from 'react';
import { Pressable, Text, type PressableProps, View } from 'react-native';

import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { motionTransition } from '@/src/lib/motion';
import { shadows } from '@/src/lib/shadows';

type ButtonVariant = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'default' | 'compact';

type ButtonProps = Omit<PressableProps, 'children' | 'disabled'> & {
  label: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: Icon;
  iconPosition?: 'left' | 'right';
};

const CONTAINER_CLASSES: Record<ButtonVariant, string> = {
  primary: 'border border-accent bg-accent',
  secondary: 'border border-white bg-white',
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
  const [isPressed, setIsPressed] = useState(false);
  const isDisabled = disabled || loading;

  return (
    <Motion.View
      animate={{ scale: isPressed && !isDisabled ? 0.98 : 1 }}
      transition={motionTransition.quick}>
      <Pressable
        {...pressableProps}
        accessibilityLabel={pressableProps.accessibilityLabel ?? label}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        className={`${CONTAINER_CLASSES[variant]} flex-row items-center justify-center gap-2 rounded-xl px-3.5 ${
          size === 'compact' ? 'min-h-9' : 'min-h-11'
        } ${isDisabled ? 'opacity-40' : ''}`}
        disabled={isDisabled}
        style={[
          variant === 'primary' ? shadows.glow : shadows.soft,
          pressableProps.style as never,
        ]}
        onPressIn={(event) => {
          setIsPressed(true);
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          setIsPressed(false);
          onPressOut?.(event);
        }}>
        {loading ? (
          <View className="h-6 w-6 items-center justify-center">
            <LoadingSpinner color={ICON_COLORS[variant]} />
          </View>
        ) : (
          <>
            {Icon && iconPosition === 'left' ? (
              <Icon
                color={ICON_COLORS[variant]}
                size={16}
                weight="bold"
              />
            ) : null}
            <Text className={`text-sm font-black tracking-tight ${TEXT_CLASSES[variant]}`}>
              {label}
            </Text>
            {Icon && iconPosition === 'right' ? (
              <Icon
                color={ICON_COLORS[variant]}
                size={16}
                weight="bold"
              />
            ) : null}
          </>
        )}
      </Pressable>
    </Motion.View>
  );
}
