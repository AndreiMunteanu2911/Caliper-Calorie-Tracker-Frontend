import { Camera, ImagePlus, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { AnimatedPresence } from '@/src/components/ui/AnimatedPresence';
import { Button } from '@/src/components/ui/Button';
import { InputBox } from '@/src/components/ui/InputBox';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { useMealAnalysis } from '@/src/hooks/useMealAnalysis';

export function MealAnalysisPanel() {
  const analysis = useMealAnalysis();
  const router = useRouter();

  return (
    <View className="gap-4">
      <View className="rounded-[26px] border border-white/10 bg-[#242424] p-5 shadow-soft">
        <View className="mb-4 h-12 w-12 items-center justify-center rounded-2xl bg-fats">
          <Sparkles color="#101010" size={22} strokeWidth={2.6} />
        </View>
        <Text className="text-2xl font-black tracking-[-0.8px] text-white">Analyze a meal</Text>
        <Text className="mt-2 leading-6 text-white/55">
          Add optional context, then photograph your meal or choose an existing image.
        </Text>
      </View>
      <InputBox
        compact
        onChangeText={analysis.setContext}
        placeholder="Optional context: chicken, rice, sauce..."
        value={analysis.context}
      />
      <View className="gap-3 sm:flex-row">
        <View className="flex-1">
          <Button
            label="Take photo"
            icon={Camera}
            iconPosition="left"
            disabled={analysis.isAnalyzing}
            onPress={() => router.push('/meal-camera')}
          />
        </View>
        <View className="flex-1">
          <Button
            label="Choose from library"
            icon={ImagePlus}
            iconPosition="left"
            variant="outline"
            disabled={analysis.isAnalyzing}
            onPress={() => void analysis.choosePhoto()}
          />
        </View>
      </View>
      {analysis.error ? (
        <AnimatedPresence className="rounded-2xl bg-dangerSoft p-4">
          <Text className="font-semibold text-danger">{analysis.error}</Text>
        </AnimatedPresence>
      ) : null}
      {analysis.isAnalyzing ? (
        <AnimatedPresence className="items-center rounded-3xl border border-white/10 bg-[#242424] px-6 py-12 shadow-card">
          <LoadingSpinner size="large" />
          <Text className="mt-4 text-lg text-center font-black text-white">Analyzing your meal</Text>
          <Text className="mt-2 text-center text-sm leading-5 text-white/45">
            Estimating foods, portions, and macros...
          </Text>
        </AnimatedPresence>
      ) : null}
      {analysis.analysis ? (
        <AnimatedPresence className="gap-4 rounded-3xl border border-white/10 bg-[#242424] p-5 shadow-card">
          <Text className="text-2xl font-black text-white">
            {Math.round(analysis.analysis.total_calories)} kcal
          </Text>
          <Text className="text-white/55">
            P {Math.round(analysis.analysis.total_protein)}g / C{' '}
            {Math.round(analysis.analysis.total_carbs)}g / F{' '}
            {Math.round(analysis.analysis.total_fats)}g
          </Text>
          {analysis.analysis.foods.map((food) => (
            <View
              className="flex-row justify-between border-t border-white/10 pt-3"
              key={`${food.name}-${food.estimated_weight_g}`}>
              <Text className="flex-1 font-bold text-white">{food.name}</Text>
              <Text className="text-white/55">
                {Math.round(food.estimated_weight_g)}g / {Math.round(food.calories)} kcal
              </Text>
            </View>
          ))}
          <Text className="text-sm leading-5 text-white/55">
            {analysis.analysis.confidence_explanation}
          </Text>
        </AnimatedPresence>
      ) : null}
    </View>
  );
}
