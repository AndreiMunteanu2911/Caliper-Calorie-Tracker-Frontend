import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native';

type LoadingSpinnerProps = {
  color?: 'brand' | 'accent' | 'white';
  size?: ActivityIndicatorProps['size'];
};

export function LoadingSpinner({
  size = 'small',
}: LoadingSpinnerProps) {
  return (
    <ActivityIndicator
      accessibilityLabel="Loading"
      accessibilityRole="progressbar"
      color="#FF5A2F"
      size={size}
    />
  );
}
