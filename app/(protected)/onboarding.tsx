import { Check } from 'lucide-react-native';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AppPage } from '@/src/components/layout/AppPage';
import { Button } from '@/src/components/ui/Button';
import { InputBox } from '@/src/components/ui/InputBox';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
import { useOnboarding } from '@/src/hooks/useOnboarding';
import { apiRequest } from '@/src/lib/api-client';
import type { OnboardingUpdate, Profile } from '@/src/types/api';
import {
  MotionPop,
  MotionPressable,
  MotionProgress,
} from '@/src/lib/motion';

const ACTIVITY = [
  ['sedentary', 'Mostly seated'],
  ['light', 'Light exercise'],
  ['moderate', '3-5 active days'],
  ['very_active', '6-7 active days'],
  ['extra_active', 'Very demanding'],
] as const;

export default function OnboardingRoute() {
  const { profile, resolve } = useOnboarding();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [sex, setSex] = useState<'female' | 'male'>('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [activity, setActivity] =
    useState<OnboardingUpdate['activity_level']>('moderate');
  const [goal, setGoal] = useState<OnboardingUpdate['goal']>('maintain');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heightCm = Number(height);
  const weightKg = Number(weight);
  const targetWeightKg = targetWeight ? Number(targetWeight) : null;
  const stepIsValid = [
    displayName.trim().length > 0 && Number(age) >= 14,
    heightCm >= 120 &&
      weightKg >= 20 &&
      (targetWeightKg === null || targetWeightKg >= 20),
    true,
  ];
  const valid = stepIsValid.every(Boolean);
  const stepContent = [
    {
      eyebrow: 'Step 1 of 3',
      title: 'Tell us about you',
      description: 'Start with the details used by the calorie formula.',
    },
    {
      eyebrow: 'Step 2 of 3',
      title: 'Your starting point',
      description: 'Add your current measurements and optional target weight.',
    },
    {
      eyebrow: 'Step 3 of 3',
      title: 'Choose your direction',
      description: 'Your goal and activity level determine your initial targets.',
    },
  ][step];

  async function complete() {
    if (!valid) return;
    setIsSaving(true);
    setError(null);
    try {
      const completed = await apiRequest<Profile>('/profile/onboarding', {
        method: 'POST',
        body: {
          display_name: displayName.trim(),
          sex,
          age: Number(age),
          height_cm: heightCm,
          weight_kg: weightKg,
          activity_level: activity,
          goal,
          target_weight_kg: targetWeightKg,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        } satisfies OnboardingUpdate,
      });
      resolve(completed);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to finish onboarding.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function skip() {
    setIsSaving(true);
    setError(null);
    try {
      const skipped = await apiRequest<Profile>('/profile/onboarding/skip', {
        method: 'POST',
      });
      resolve(skipped);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to skip onboarding.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScrollbarContainer
      className="flex-1 bg-brand"
      contentContainerClassName="pb-8 pt-8">
      <AppPage>
        <Text className="text-xs font-black uppercase tracking-widest text-accent">
          {stepContent.eyebrow}
        </Text>
        <Text className="mt-2 text-3xl font-black tracking-tight text-white">
          {stepContent.title}
        </Text>
        <Text className="mt-2 leading-6 text-white/55">
          {stepContent.description}
        </Text>

        <View className="mt-5 flex-row gap-2">
          {[0, 1, 2].map((index) => (
            <View
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"
              key={index}>
              <MotionProgress
                progress={index <= step ? 1 : 0}
                style={{ backgroundColor: '#FF5A16', borderRadius: 999 }}
              />
            </View>
          ))}
        </View>

        <View className="mt-6 gap-4">
          {step === 0 ? (
            <>
              <Field label="Display name">
                <InputBox value={displayName} onChangeText={setDisplayName} compact />
              </Field>

              <Field label="Sex used by the calorie formula">
                <ChoiceRow
                  equalWidth
                  options={[
                    ['female', 'Female'],
                    ['male', 'Male'],
                  ]}
                  value={sex}
                  onChange={(value) => setSex(value as 'female' | 'male')}
                />
              </Field>

              <Field label="Age">
                <InputBox keyboardType="number-pad" value={age} onChangeText={setAge} compact />
              </Field>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <Field label="Height (cm)">
                <InputBox keyboardType="decimal-pad" value={height} onChangeText={setHeight} compact />
              </Field>
              <Field label="Current weight (kg)">
                <InputBox keyboardType="decimal-pad" value={weight} onChangeText={setWeight} compact />
              </Field>
              <Field label="Target weight (kg, optional)">
                <InputBox keyboardType="decimal-pad" value={targetWeight} onChangeText={setTargetWeight} compact />
              </Field>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <Field label="Goal">
                <ChoiceRow
                  options={[
                    ['lose', 'Lose'],
                    ['maintain', 'Maintain'],
                    ['gain', 'Gain'],
                  ]}
                  value={goal}
                  onChange={(value) => setGoal(value as OnboardingUpdate['goal'])}
                />
              </Field>

              <Field label="Activity level">
                <View className="gap-2">
                  {ACTIVITY.map(([value, label]) => (
                    <Choice
                      key={value}
                      label={label}
                      selected={activity === value}
                      onPress={() => setActivity(value)}
                    />
                  ))}
                </View>
              </Field>
            </>
          ) : null}

          {error ? (
            <View className="rounded-2xl bg-dangerSoft p-4">
              <Text className="font-semibold text-danger">{error}</Text>
            </View>
          ) : null}

          <View className="flex-row gap-3">
            {step > 0 ? (
              <View className="flex-1">
                <Button
                  label="Back"
                  variant="outline"
                  disabled={isSaving}
                  onPress={() => setStep((current) => current - 1)}
                />
              </View>
            ) : null}
            <View className="flex-1">
              {step < 2 ? (
                <Button
                  label="Continue"
                  disabled={!stepIsValid[step] || isSaving}
                  onPress={() => setStep((current) => current + 1)}
                />
              ) : (
                <Button
                  label="Create my targets"
                  loading={isSaving}
                  disabled={!valid}
                  onPress={() => void complete()}
                />
              )}
            </View>
          </View>
          <Button
            label="Skip and use standard goals"
            variant="outline"
            disabled={isSaving}
            onPress={() => void skip()}
          />
        </View>
      </AppPage>
    </ScrollbarContainer>
  );
}

function Field({
  label,
  grow = false,
  children,
}: {
  label: string;
  grow?: boolean;
  children: ReactNode;
}) {
  return (
    <View className={`${grow ? 'min-w-0 flex-1' : ''} gap-2`}>
      <Text className="text-sm font-black text-white">{label}</Text>
      {children}
    </View>
  );
}

function ChoiceRow({
  options,
  value,
  onChange,
  equalWidth = false,
}: {
  options: readonly (readonly [string, string])[];
  value: string;
  onChange: (value: string) => void;
  equalWidth?: boolean;
}) {
  return (
    <View className={`flex-row gap-2 ${equalWidth ? '' : 'flex-wrap'}`}>
      {options.map(([option, label]) => (
        <View className={equalWidth ? 'min-w-0 flex-1' : ''} key={option}>
          <Choice
            fill={equalWidth}
            label={label}
            selected={value === option}
            onPress={() => onChange(option)}
          />
        </View>
      ))}
    </View>
  );
}

function Choice({
  label,
  selected,
  onPress,
  fill = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  fill?: boolean;
}) {
  return (
    <MotionPressable
      className={`${fill ? 'relative w-full justify-center' : ''} flex-row items-center gap-2 rounded-xl border px-3 py-2.5 ${
        selected
          ? 'border-accent bg-accent'
          : 'border-white/10 bg-[#232220]'
      }`}
      containerClassName={fill ? 'w-full' : ''}
      selected={selected}
      onPress={onPress}>
      {selected ? (
        <MotionPop
          style={fill ? { left: 12, position: 'absolute' } : undefined}>
          <Check color="#FFFFFF" size={14} />
        </MotionPop>
      ) : null}
      <Text className={selected ? 'font-black text-white' : 'font-bold text-white/60'}>
        {label}
      </Text>
    </MotionPressable>
  );
}
