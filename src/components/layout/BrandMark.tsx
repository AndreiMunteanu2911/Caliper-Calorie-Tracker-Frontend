import { Text, View } from 'react-native';

type BrandMarkProps = {
  compact?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-10 w-10 items-center justify-center rounded-2xl bg-brand">
        <View className="h-4 w-4 rounded-full border-[3px] border-accent" />
      </View>
      {!compact ? (
        <Text className="text-2xl font-black tracking-tight text-ink">Caliper</Text>
      ) : null}
    </View>
  );
}
