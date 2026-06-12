import { Image, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { usePlateAnalysis } from '@/src/hooks/usePlateAnalysis';

export function PlateAnalysisPanel() {
  const plate = usePlateAnalysis();

  return (
    <View className="gap-4">
      <TextInput
        accessibilityLabel="Meal context"
        className="min-h-14 rounded-2xl bg-panel px-4 py-3 text-base text-white"
        onChangeText={plate.setContext}
        placeholder="Optional context: chicken, rice, sauce..."
        placeholderTextColor="#8da399"
        value={plate.context}
      />
      <PrimaryButton
        label="Choose meal photo"
        loading={plate.isAnalyzing}
        onPress={() => void plate.pickAndAnalyze()}
      />
      {plate.error ? <Text className="text-red-300">{plate.error}</Text> : null}
      {plate.imageUri ? (
        <Image
          accessibilityLabel="Selected meal"
          className="h-64 w-full rounded-3xl"
          resizeMode="cover"
          source={{ uri: plate.imageUri }}
        />
      ) : null}
      {plate.analysis ? (
        <View className="gap-4 rounded-3xl bg-panel p-5">
          <Text className="text-2xl font-bold text-white">
            {Math.round(plate.analysis.total_calories)} kcal
          </Text>
          <Text className="text-muted">
            P {Math.round(plate.analysis.total_protein)}g / C{' '}
            {Math.round(plate.analysis.total_carbs)}g / F{' '}
            {Math.round(plate.analysis.total_fats)}g
          </Text>
          {plate.analysis.foods.map((food) => (
            <View
              className="flex-row justify-between border-t border-white/10 pt-3"
              key={`${food.name}-${food.estimated_weight_g}`}>
              <Text className="flex-1 text-white">{food.name}</Text>
              <Text className="text-muted">
                {Math.round(food.estimated_weight_g)}g / {Math.round(food.calories)} kcal
              </Text>
            </View>
          ))}
          <Text className="text-sm leading-5 text-muted">
            {plate.analysis.confidence_explanation}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
