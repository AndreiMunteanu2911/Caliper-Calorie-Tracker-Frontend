import { Pressable, Text, View } from 'react-native';

import { MEAL_TYPES, type MealType } from '@/src/types/api';

type MealTypeSelectorProps = {
  value: MealType;
  onChange: (value: MealType) => void;
};

const LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export function MealTypeSelector({ value, onChange }: MealTypeSelectorProps) {
  return (
    <View accessibilityRole="radiogroup" className="flex-row flex-wrap gap-2">
      {MEAL_TYPES.map((mealType) => {
        const selected = mealType === value;
        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            className={`rounded-full border px-4 py-2 ${
              selected ? 'border-brand bg-brand' : 'border-line bg-surface'
            }`}
            key={mealType}
            onPress={() => onChange(mealType)}>
            <Text className={selected ? 'font-black text-white' : 'font-bold text-muted'}>
              {LABELS[mealType]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
