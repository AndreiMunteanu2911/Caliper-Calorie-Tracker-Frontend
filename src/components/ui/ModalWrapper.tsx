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
  Easing,
  ReduceMotion,
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
  const translateY = useSharedValue(isBottom ? 24 : 8);
  const scale = useSharedValue(isBottom ? 1 : 0.985);

  useEffect(() => {
    if (isOpen) setIsMounted(true);
  }, [isOpen]);

  useEffect(() => {
    if (!isMounted) return;

    if (isOpen) {
      backdropOpacity.value = 0;
      translateY.value = isBottom ? 24 : 8;
      scale.value = isBottom ? 1 : 0.985;
      const frame = requestAnimationFrame(() => {
        backdropOpacity.value = withTiming(1, {
          duration: 140,
          easing: Easing.out(Easing.cubic),
          reduceMotion: ReduceMotion.System,
        });
        translateY.value = withTiming(0, {
          duration: 170,
          easing: Easing.out(Easing.cubic),
          reduceMotion: ReduceMotion.System,
        });
        scale.value = withTiming(1, {
          duration: 170,
          easing: Easing.out(Easing.cubic),
          reduceMotion: ReduceMotion.System,
        });
      });
      return () => cancelAnimationFrame(frame);
    }

    backdropOpacity.value = withTiming(0, {
      duration: 100,
      reduceMotion: ReduceMotion.System,
    });
    scale.value = withTiming(isBottom ? 1 : 0.99, {
      duration: 120,
      reduceMotion: ReduceMotion.System,
    });
    translateY.value = withTiming(
      isBottom ? 18 : 6,
      {
        duration: 120,
        easing: Easing.in(Easing.cubic),
        reduceMotion: ReduceMotion.System,
      },
      (finished) => {
        if (finished) runOnJS(setIsMounted)(false);
      },
    );
  }, [backdropOpacity, isBottom, isMounted, isOpen, scale, translateY]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
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
        style={[StyleSheet.absoluteFill, { height, width }]}>
        <Animated.View
          className={className}
          style={[
            StyleSheet.absoluteFill,
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
            style={StyleSheet.absoluteFill}
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
