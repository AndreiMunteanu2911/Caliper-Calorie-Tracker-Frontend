import { Motion } from '@legendapp/motion';
import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';

import { motionTransition } from '@/src/lib/motion';

type ModalWrapperProps = PropsWithChildren<{
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  containerClassName?: string;
  position?: 'center' | 'bottom';
}>;

export function ModalWrapper({
  isOpen,
  onClose,
  children,
  className = '',
  containerClassName = '',
  position = 'center',
}: ModalWrapperProps) {
  const isBottom = position === 'bottom';
  const { width, height } = useWindowDimensions();
  const modalWidth = Math.min(width * 0.9, 560);
  const modalMaxHeight = Math.min(height * 0.9, 760);
  const [isMounted, setIsMounted] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setIsMounted(true);
  }, [isOpen]);

  useEffect(() => {
    if (!isMounted || isOpen) return;
    const timer = setTimeout(() => setIsMounted(false), 170);
    return () => clearTimeout(timer);
  }, [isMounted, isOpen]);

  return (
    <Modal
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={isMounted}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[StyleSheet.absoluteFill, { height, width }]}>
        <Motion.View
          animate={{ opacity: isOpen ? 1 : 0 }}
          className={className}
          initial={{ opacity: 0 }}
          style={[
            StyleSheet.absoluteFill,
            {
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.82)',
              justifyContent: isBottom ? 'flex-end' : 'center',
              paddingHorizontal: 16,
              paddingVertical: 24,
            },
          ]}
          transition={motionTransition.quick}>
          <Pressable
            accessibilityLabel="Close modal"
            onPress={onClose}
            style={StyleSheet.absoluteFill}
          />
          <Motion.View
            accessibilityViewIsModal
            animate={{
              scale: isOpen || isBottom ? 1 : 0.99,
              y: isOpen ? 0 : isBottom ? 18 : 6,
            }}
            className={containerClassName}
            initial={{
              scale: isBottom ? 1 : 0.985,
              y: isBottom ? 24 : 8,
            }}
            style={[
              {
                backgroundColor: '#202020',
                borderColor: 'rgba(255, 255, 255, 0.14)',
                borderRadius: 30,
                borderWidth: 1,
                maxHeight: modalMaxHeight,
                overflow: 'hidden',
                width: modalWidth,
              },
            ]}
            transition={motionTransition.standard}>
            {children}
          </Motion.View>
        </Motion.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
