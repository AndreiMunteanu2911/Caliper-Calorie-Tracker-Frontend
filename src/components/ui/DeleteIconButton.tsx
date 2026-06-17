import { Motion } from '@legendapp/motion';
import { TrashSimpleIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { Pressable, type PressableProps } from 'react-native';

import { motionTransition } from '@/src/lib/motion';

type DeleteIconButtonProps = Omit<PressableProps, 'children'>;

export function DeleteIconButton({
  className = '',
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: DeleteIconButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Motion.View
      animate={{ scale: isPressed && !disabled ? 0.98 : 1 }}
      transition={motionTransition.quick}>
      <Pressable
        {...props}
        accessibilityRole="button"
        className={`h-9 w-9 items-center justify-center rounded-full bg-brand ${className}`}
        disabled={disabled}
        onPressIn={(event) => {
          setIsPressed(true);
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          setIsPressed(false);
          onPressOut?.(event);
        }}>
        <TrashSimpleIcon color="#FF5A16" size={15} />
      </Pressable>
    </Motion.View>
  );
}
