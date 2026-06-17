import { FlameIcon } from 'phosphor-react-native';
import { Text, View } from 'react-native';

import { MotionPressable } from '@/src/lib/motion';
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
    <MotionPressable
      accessibilityRole="button"
      className={`rounded-2xl border border-white/[0.06] bg-[#232323] px-3.5 py-3 active:bg-white/[0.06] ${
        isLast ? '' : 'mb-1.5'
      } ${className}`}
      lift
      onPress={onPress}>
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-accentSoft">
          <FlameIcon color="#FF5A16" size={17} weight="bold" />
        </View>
        <View className="min-w-0 flex-1 gap-0.5">
          <Text
            className="text-sm font-black text-white"
            numberOfLines={1}
          >
            {label}
          </Text>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-xs font-bold text-white">
              {Math.round(calories)}
              <Text className="text-xs font-bold text-white/40"> kcal</Text>
            </Text>
            <Text className="text-xs text-white/20">·</Text>
            <View className="flex-row gap-1.5">
              <Text className="text-xs font-bold text-protein">
                P {protein.toFixed(1)}g
              </Text>
              <Text className="text-xs font-bold text-carbs">
                C {carbs.toFixed(1)}g
              </Text>
              <Text className="text-xs font-bold text-fats">
                F {fats.toFixed(1)}g
              </Text>
            </View>
          </View>
        </View>
      </View>
    </MotionPressable>
  );
}
