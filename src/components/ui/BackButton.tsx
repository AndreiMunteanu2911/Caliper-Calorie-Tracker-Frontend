import { Motion } from '@legendapp/motion';
import { CaretLeftIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { Pressable, type PressableProps } from 'react-native';

import { motionTransition } from '@/src/lib/motion';

type BackButtonProps = Omit<PressableProps, 'children'>;

export function BackButton({
  accessibilityLabel = 'Go back',
  className = '',
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: BackButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Motion.View
      animate={{ scale: isPressed && !disabled ? 0.98 : 1 }}
      transition={motionTransition.quick}>
      <Pressable
        {...props}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        className={`h-10 w-10 items-center justify-center rounded-xl bg-[#232220] ${className}`}
        disabled={disabled}
        onPressIn={(event) => {
          setIsPressed(true);
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          setIsPressed(false);
          onPressOut?.(event);
        }}>
        <CaretLeftIcon color="#FFFFFF" size={20} weight="bold" />
      </Pressable>
    </Motion.View>
  );
}
