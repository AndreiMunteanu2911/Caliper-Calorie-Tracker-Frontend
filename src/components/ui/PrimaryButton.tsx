import { ActivityIndicator, Pressable, Text } from 'react-native';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      className="min-h-12 items-center justify-center rounded-2xl bg-lime px-5 active:opacity-80 disabled:opacity-50"
      disabled={disabled || loading}
      onPress={onPress}>
      {loading ? (
        <ActivityIndicator color="#07110d" />
      ) : (
        <Text className="text-base font-bold text-canvas">{label}</Text>
      )}
    </Pressable>
  );
}
