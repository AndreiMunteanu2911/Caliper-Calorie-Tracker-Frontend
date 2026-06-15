import { Flame } from 'lucide-react-native';
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
      className={`rounded-[16px] border border-white/[0.06] bg-[#232323] px-3.5 py-3 active:bg-white/[0.06] ${
        isLast ? '' : 'mb-1.5'
      } ${className}`}
      onPress={onPress}>
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-accentSoft">
          <Flame color="#FF5A16" size={17} strokeWidth={2.6} />
        </View>
        <View className="min-w-0 flex-1">
          <Text
            className="text-sm font-black text-white"
            numberOfLines={1}
          >
            {label}
          </Text>
          <Text
            className="mt-0.5 text-xs text-white/45"
            numberOfLines={1}
          >
            {subtitle || 'Nutrition per 100g'}
          </Text>
        </View>
        <View className="items-end gap-1">
          <View className="flex-row items-center gap-1 rounded-lg bg-white/[0.06] px-2 py-0.5">
            <Text className="text-xs font-black text-white">
              {Math.round(calories)}
            </Text>
            <Text className="text-[9px] font-bold text-white/40">kcal</Text>
          </View>
          <View className="flex-row gap-1">
            <View className="rounded-md bg-protein/10 px-1.5 py-0.5">
              <Text className="text-[9px] font-black text-protein">
                P {protein.toFixed(1)}g
              </Text>
            </View>
            <View className="rounded-md bg-carbs/10 px-1.5 py-0.5">
              <Text className="text-[9px] font-black text-carbs">
                C {carbs.toFixed(1)}g
              </Text>
            </View>
            <View className="rounded-md bg-fats/10 px-1.5 py-0.5">
              <Text className="text-[9px] font-black text-fats">
                F {fats.toFixed(1)}g
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
