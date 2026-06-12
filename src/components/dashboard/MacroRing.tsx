import { Text, View } from 'react-native';

type MacroRingProps = {
  label: string;
  consumed: number;
  target: number;
  colorClass: string;
};

export function MacroRing({
  label,
  consumed,
  target,
  colorClass,
}: MacroRingProps) {
  const percentage = target > 0 ? Math.min(consumed / target, 1) : 0;
  return (
    <View className="items-center gap-2">
      <View className={`h-24 w-24 items-center justify-center rounded-full border-8 ${colorClass}`}>
        <Text className="text-xl font-bold text-white">{Math.round(consumed)}g</Text>
        <Text className="text-xs text-muted">{Math.round(percentage * 100)}%</Text>
      </View>
      <Text className="text-sm font-semibold text-white">{label}</Text>
      <Text className="text-xs text-muted">of {Math.round(target)}g</Text>
    </View>
  );
}
