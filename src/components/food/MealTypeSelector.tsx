import { CookieIcon, MoonIcon, SunIcon, SunHorizonIcon } from 'phosphor-react-native';
import { Text, View } from 'react-native';

import { MotionPressable } from '@/src/lib/motion';
import { MEAL_TYPES, type MealType } from '@/src/types/api';

type MealTypeSelectorProps = {
  value: MealType;
  onChange: (value: MealType) => void;
  dark?: boolean;
};

const LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

const ICONS = {
  breakfast: SunHorizonIcon,
  lunch: SunIcon,
  dinner: MoonIcon,
  snack: CookieIcon,
} satisfies Record<MealType, typeof SunHorizonIcon>;

export function MealTypeSelector({
  value,
  onChange,
  dark = false,
}: MealTypeSelectorProps) {
  return (
    <View accessibilityRole="radiogroup" className="flex-row flex-wrap gap-2">
      {MEAL_TYPES.map((mealType) => {
        const selected = mealType === value;
        const Icon = ICONS[mealType];
        return (
          <MotionPressable
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            className={`flex-row items-center gap-1.5 rounded-full border px-3 py-2 ${
              selected
                ? 'border-accent bg-accent'
                : dark
                  ? 'border-white/10 bg-white/5'
                  : 'border-line bg-surface'
            }`}
            key={mealType}
            selected={selected}
            onPress={() => onChange(mealType)}>
            <Icon
              color={selected ? '#FFFFFF' : dark ? '#B6B6B6' : '#77756F'}
              size={13}
              weight="bold"
            />
            <Text
              className={
                selected
                  ? 'font-black text-white'
                  : dark
                    ? 'font-bold text-white/65'
                    : 'font-bold text-muted'
              }>
              {LABELS[mealType]}
            </Text>
          </MotionPressable>
        );
      })}
    </View>
  );
}
