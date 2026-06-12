import { Cookie, Moon, Sun, Sunrise } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

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
  breakfast: Sunrise,
  lunch: Sun,
  dinner: Moon,
  snack: Cookie,
} satisfies Record<MealType, typeof Sunrise>;

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
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            className={`flex-row items-center gap-2 rounded-full border px-4 py-2.5 ${
              selected
                ? 'border-accent bg-accent'
                : dark
                  ? 'border-white/10 bg-white/5'
                  : 'border-line bg-surface'
            }`}
            key={mealType}
            onPress={() => onChange(mealType)}>
            <Icon
              color={selected ? '#FFFFFF' : dark ? '#B6B6B6' : '#77756F'}
              size={15}
              strokeWidth={2.5}
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
          </Pressable>
        );
      })}
    </View>
  );
}
