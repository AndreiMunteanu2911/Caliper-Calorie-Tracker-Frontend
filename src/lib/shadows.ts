import { Platform, StyleSheet, type ViewStyle } from 'react-native';

const nativeShadow = (
  elevation: number,
  opacity: number,
  radius: number,
  height: number,
  color = '#101010',
) =>
  Platform.select({
    android: { elevation },
    default: {
      shadowColor: color,
      shadowOffset: { width: 0, height },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
  }) ?? ({} as ViewStyle);

export const shadows = StyleSheet.create({
  card: nativeShadow(10, 0.16, 30, 14),
  glow: nativeShadow(8, 0.24, 18, 8, '#FF5A2F'),
  soft: nativeShadow(5, 0.08, 14, 5),
});
