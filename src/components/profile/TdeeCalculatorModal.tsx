import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  FadeInLeft,
  FadeInRight,
} from 'react-native-reanimated';

import { Button } from '@/src/components/ui/Button';
import { InputBox } from '@/src/components/ui/InputBox';
import { ModalHeader } from '@/src/components/ui/ModalHeader';
import { ModalWrapper } from '@/src/components/ui/ModalWrapper';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
import { apiRequest } from '@/src/lib/api-client';
import { motion } from '@/src/lib/motion';
import type {
  TdeeCalculationRequest,
  TdeeCalculationResponse,
} from '@/src/types/api';

type TdeeCalculatorModalProps = {
  isOpen: boolean;
  initialWeightKg?: number | null;
  onApply: (result: TdeeCalculationResponse) => Promise<boolean>;
  onClose: () => void;
};

type Step = 1 | 2 | 3;

const ACTIVITY_OPTIONS: {
  label: string;
  description: string;
  value: TdeeCalculationRequest['activity_level'];
}[] = [
  { label: 'Sedentary', description: 'Little regular exercise', value: 'sedentary' },
  { label: 'Light', description: 'Exercise 1-3 days weekly', value: 'light' },
  { label: 'Moderate', description: 'Exercise 3-5 days weekly', value: 'moderate' },
  { label: 'Very active', description: 'Hard exercise most days', value: 'very_active' },
  { label: 'Extra active', description: 'Physical work or intense training', value: 'extra_active' },
];

const GOAL_OPTIONS: {
  label: string;
  description: string;
  value: TdeeCalculationRequest['goal'];
}[] = [
  { label: 'Lose', description: 'About 500 kcal below maintenance', value: 'lose' },
  { label: 'Maintain', description: 'Stay around maintenance', value: 'maintain' },
  { label: 'Gain', description: 'About 300 kcal above maintenance', value: 'gain' },
];

function ChoiceCards<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; description: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View className="gap-2">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            className={`rounded-2xl border px-4 py-3 ${
              selected
                ? 'border-accent bg-accent/10'
                : 'border-white/10 bg-[#151515]'
            }`}
            key={option.value}
            onPress={() => onChange(option.value)}>
            <Text className={selected ? 'font-black text-accent' : 'font-black text-white'}>
              {option.label}
            </Text>
            <Text className="mt-0.5 text-xs text-white/45">
              {option.description}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function StepIndicator({ step }: { step: Step }) {
  return (
    <View className="flex-row gap-2">
      {[1, 2, 3].map((item) => (
        <View
          className={`h-1.5 flex-1 rounded-full ${
            item <= step ? 'bg-accent' : 'bg-white/10'
          }`}
          key={item}
        />
      ))}
    </View>
  );
}

export function TdeeCalculatorModal({
  isOpen,
  initialWeightKg,
  onApply,
  onClose,
}: TdeeCalculatorModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [sex, setSex] = useState<TdeeCalculationRequest['sex']>('female');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] =
    useState<TdeeCalculationRequest['activity_level']>('moderate');
  const [goal, setGoal] = useState<TdeeCalculationRequest['goal']>('maintain');
  const [result, setResult] = useState<TdeeCalculationResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setDirection(1);
    setError(null);
    setResult(null);
    if (initialWeightKg) setWeight(initialWeightKg.toString());
  }, [initialWeightKg, isOpen]);

  const ageValue = Number(age);
  const heightValue = Number(height.replace(',', '.'));
  const weightValue = Number(weight.replace(',', '.'));
  const detailsValid =
    ageValue >= 14 &&
    ageValue <= 100 &&
    heightValue >= 120 &&
    heightValue <= 250 &&
    weightValue >= 20 &&
    weightValue <= 500;

  function goTo(nextStep: Step) {
    setDirection(nextStep > step ? 1 : -1);
    setError(null);
    setStep(nextStep);
  }

  async function calculate() {
    if (!detailsValid) return;
    setIsCalculating(true);
    setError(null);
    try {
      const nextResult = await apiRequest<TdeeCalculationResponse>('/profile/tdee', {
        method: 'POST',
        body: {
          sex,
          age: ageValue,
          height_cm: heightValue,
          weight_kg: weightValue,
          activity_level: activity,
          goal,
        } satisfies TdeeCalculationRequest,
      });
      setResult(nextResult);
      goTo(3);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to calculate your goals.',
      );
    } finally {
      setIsCalculating(false);
    }
  }

  async function apply() {
    if (!result) return;
    setIsApplying(true);
    setError(null);
    const didApply = await onApply(result);
    setIsApplying(false);
    if (didApply) {
      onClose();
    } else {
      setError('Unable to apply the calculated goals.');
    }
  }

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <ModalHeader
        title="TDEE calculator"
        description={`Step ${step} of 3 - ${
          step === 1
            ? 'Your measurements'
            : step === 2
              ? 'Activity and goal'
              : 'Recommended targets'
        }`}
        onClose={onClose}
      />
      <ScrollbarContainer
        contentContainerClassName="gap-5 p-5"
        keyboardShouldPersistTaps="handled">
        <StepIndicator step={step} />

        <Animated.View
          entering={
            direction > 0
              ? FadeInRight.duration(180)
              : FadeInLeft.duration(180)
          }
          key={step}>
          {step === 1 ? (
            <View className="gap-5">
              <View className="gap-2">
                <Text className="text-sm font-bold text-white/70">Sex</Text>
                <View className="flex-row gap-2">
                  {(['female', 'male'] as const).map((option) => (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ selected: sex === option }}
                      className={`flex-1 items-center rounded-xl border py-3 ${
                        sex === option
                          ? 'border-accent bg-accent'
                          : 'border-white/10 bg-[#151515]'
                      }`}
                      key={option}
                      onPress={() => setSex(option)}>
                      <Text className="font-black text-white">
                        {option === 'female' ? 'Female' : 'Male'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View className="gap-3">
                <View className="gap-1.5">
                  <Text className="pl-2 text-sm font-bold text-white/70">Age</Text>
                  <InputBox
                    accessibilityLabel="Age"
                    compact
                    keyboardType="number-pad"
                    placeholder="14-100"
                    placeholderTextColor="#777777"
                    value={age}
                    onChangeText={setAge}
                  />
                </View>
                <View className="flex-row gap-3">
                  <View className="min-w-0 flex-1 gap-1.5">
                    <Text className="pl-2 text-sm font-bold text-white/70">
                      Height
                    </Text>
                    <InputBox
                      accessibilityLabel="Height in centimeters"
                      compact
                      keyboardType="decimal-pad"
                      placeholder="cm"
                      placeholderTextColor="#777777"
                      value={height}
                      onChangeText={setHeight}
                    />
                  </View>
                  <View className="min-w-0 flex-1 gap-1.5">
                    <Text className="pl-2 text-sm font-bold text-white/70">
                      Weight
                    </Text>
                    <InputBox
                      accessibilityLabel="Weight in kilograms"
                      compact
                      keyboardType="decimal-pad"
                      placeholder="kg"
                      placeholderTextColor="#777777"
                      value={weight}
                      onChangeText={setWeight}
                    />
                  </View>
                </View>
              </View>
            </View>
          ) : null}

          {step === 2 ? (
            <View className="gap-5">
              <View className="gap-2">
                <Text className="text-sm font-bold text-white/70">
                  Activity level
                </Text>
                <ChoiceCards
                  options={ACTIVITY_OPTIONS}
                  value={activity}
                  onChange={setActivity}
                />
              </View>
              <View className="gap-2">
                <Text className="text-sm font-bold text-white/70">
                  Primary goal
                </Text>
                <ChoiceCards
                  options={GOAL_OPTIONS}
                  value={goal}
                  onChange={setGoal}
                />
              </View>
            </View>
          ) : null}

          {step === 3 && result ? (
            <View className="gap-4">
              <View className="rounded-2xl border border-accent/40 bg-[#191919] p-4">
                <Text className="text-xs font-black uppercase tracking-widest text-white/40">
                  Daily calorie goal
                </Text>
                <Text className="mt-1 text-3xl font-black text-accent">
                  {Math.round(result.daily_calorie_target)}
                  <Text className="text-sm text-white/45"> kcal</Text>
                </Text>
                <Text className="mt-2 text-sm text-white/50">
                  Estimated maintenance: {Math.round(result.tdee)} kcal
                </Text>
              </View>
              <View className="flex-row gap-2">
                {[
                  ['Protein', result.daily_protein_target],
                  ['Carbs', result.daily_carbs_target],
                  ['Fat', result.daily_fats_target],
                ].map(([label, value]) => (
                  <View
                    className="min-w-0 flex-1 rounded-2xl bg-[#151515] p-3"
                    key={String(label)}>
                    <Text className="text-xs font-bold text-white/40">
                      {label}
                    </Text>
                    <Text className="mt-1 font-black text-white">
                      {Math.round(Number(value))}g
                    </Text>
                  </View>
                ))}
              </View>
              <Text className="text-xs leading-4 text-white/35">
                This estimate uses the Mifflin-St Jeor equation and is a
                planning tool, not medical advice.
              </Text>
            </View>
          ) : null}
        </Animated.View>

        {error ? (
          <Animated.View
            className="rounded-2xl bg-dangerSoft p-3"
            entering={motion.enter}
            exiting={motion.exit}>
            <Text className="font-semibold text-danger">{error}</Text>
          </Animated.View>
        ) : null}

        <View className="flex-row gap-3">
          <View className="min-w-0 flex-1">
            <Button
              label={step === 1 ? 'Close' : 'Back'}
              variant="secondary"
              onPress={() => {
                if (step === 1) onClose();
                else goTo((step - 1) as Step);
              }}
            />
          </View>
          <View className="min-w-0 flex-1">
            {step === 1 ? (
              <Button
                disabled={!detailsValid}
                label="Next"
                onPress={() => goTo(2)}
              />
            ) : step === 2 ? (
              <Button
                label="Calculate goals"
                loading={isCalculating}
                onPress={() => void calculate()}
              />
            ) : (
              <Button
                label="Apply goals"
                loading={isApplying}
                onPress={() => void apply()}
              />
            )}
          </View>
        </View>
      </ScrollbarContainer>
    </ModalWrapper>
  );
}
