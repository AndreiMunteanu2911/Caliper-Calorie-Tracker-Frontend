import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native';

type LoadingSpinnerProps = {
  color?: 'brand' | 'accent' | 'white' | string;
  size?: ActivityIndicatorProps['size'];
};

const SPINNER_COLORS: Record<string, string> = {
  brand: '#101010',
  accent: '#FF5A16',
  white: '#FFFFFF',
};

export function LoadingSpinner({
  color = 'accent',
  size = 'small',
}: LoadingSpinnerProps) {
  const resolvedColor = SPINNER_COLORS[color] ?? color;

  return (
    <ActivityIndicator
      accessibilityLabel="Loading"
      accessibilityRole="progressbar"
      color={resolvedColor}
      size={size}
    />
  );
}
