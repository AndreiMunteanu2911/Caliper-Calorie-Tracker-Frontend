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
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

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
  const backdropOpacity = useSharedValue(0);
  const translateY = useSharedValue(height);

  useEffect(() => {
    if (isOpen) setIsMounted(true);
  }, [isOpen]);

  useEffect(() => {
    if (!isMounted) return;

    if (isOpen) {
      backdropOpacity.value = 0;
      translateY.value = height;
      const frame = requestAnimationFrame(() => {
        backdropOpacity.value = withTiming(1, { duration: 180 });
        translateY.value = withTiming(0, { duration: 260 });
      });
      return () => cancelAnimationFrame(frame);
    }

    backdropOpacity.value = withTiming(0, { duration: 180 });
    translateY.value = withTiming(height, { duration: 230 }, (finished) => {
      if (finished) runOnJS(setIsMounted)(false);
    });
  }, [backdropOpacity, height, isMounted, isOpen, translateY]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={isMounted}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[StyleSheet.absoluteFillObject, { height, width }]}>
        <Animated.View
          className={className}
          style={[
            StyleSheet.absoluteFillObject,
            backdropStyle,
            {
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.82)',
              justifyContent: isBottom ? 'flex-end' : 'center',
              paddingHorizontal: 16,
              paddingVertical: 24,
            },
          ]}>
          <Pressable
            accessibilityLabel="Close modal"
            onPress={onClose}
            style={StyleSheet.absoluteFillObject}
          />
          <Animated.View
            accessibilityViewIsModal
            className={containerClassName}
            style={[
              containerStyle,
              {
                backgroundColor: '#202020',
                borderColor: 'rgba(255, 255, 255, 0.14)',
                borderRadius: 30,
                borderWidth: 1,
                maxHeight: modalMaxHeight,
                overflow: 'hidden',
                width: modalWidth,
              },
            ]}>
            {children}
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
