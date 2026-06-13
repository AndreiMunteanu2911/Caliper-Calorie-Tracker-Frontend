import { ChevronRight, Flame } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

type DropdownItemProps = {
  label: string;
  subtitle: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  onPress: () => void;
  isLast?: boolean;
  className?: string;
};

export function DropdownItem({
  label,
  subtitle,
  calories,
  protein,
  carbs,
  fats,
  onPress,
  isLast = false,
  className = '',
}: DropdownItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`rounded-[18px] px-4 py-4 active:bg-white/10 ${
        isLast ? '' : 'mb-1'
      } ${className}`}
      onPress={onPress}>
      <View className="flex-row items-start gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-accentSoft">
          <Flame color="#FF5A16" size={18} strokeWidth={2.6} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-base font-black text-white" numberOfLines={1}>
            {label}
          </Text>
          <Text className="mt-0.5 text-sm text-white/45" numberOfLines={1}>
            {subtitle || 'Nutrition per 100g'}
          </Text>
        </View>
        <View className="items-end">
          <Text className="font-black text-white">{Math.round(calories)}</Text>
          <Text className="text-xs font-semibold text-white/40">kcal</Text>
        </View>
        <ChevronRight color="#777777" size={18} strokeWidth={2.5} />
      </View>
      <View className="mt-3 flex-row gap-2">
        <View className="rounded-lg bg-protein/15 px-2.5 py-1">
          <Text className="text-xs font-black text-protein">
            P {protein.toFixed(1)}g
          </Text>
        </View>
        <View className="rounded-lg bg-carbs/15 px-2.5 py-1">
          <Text className="text-xs font-black text-carbs">
            C {carbs.toFixed(1)}g
          </Text>
        </View>
        <View className="rounded-lg bg-fats/15 px-2.5 py-1">
          <Text className="text-xs font-black text-fats">
            F {fats.toFixed(1)}g
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
