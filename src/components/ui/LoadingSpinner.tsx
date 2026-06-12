import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native';

type LoadingSpinnerProps = {
  color?: 'brand' | 'accent' | 'white';
  size?: ActivityIndicatorProps['size'];
};

const COLORS = {
  brand: '#173F35',
  accent: '#B8F04A',
  white: '#FFFFFF',
} as const;

export function LoadingSpinner({
  color = 'brand',
  size = 'small',
}: LoadingSpinnerProps) {
  return (
    <ActivityIndicator
      accessibilityLabel="Loading"
      accessibilityRole="progressbar"
      color={COLORS[color]}
      size={size}
    />
  );
}
