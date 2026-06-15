import { useRouter } from 'expo-router';
import {
  LogOut,
  UserRound,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AppPage } from '@/src/components/layout/AppPage';
import { PageHeader } from '@/src/components/layout/PageHeader';
import { TdeeCalculatorModal } from '@/src/components/profile/TdeeCalculatorModal';
import { AnimatedPresence } from '@/src/components/ui/AnimatedPresence';
import { Button } from '@/src/components/ui/Button';
import { InputBox } from '@/src/components/ui/InputBox';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ModalHeader } from '@/src/components/ui/ModalHeader';
import { ModalWrapper } from '@/src/components/ui/ModalWrapper';
import { NumberSpinner } from '@/src/components/ui/NumberSpinner';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
import { useAuth } from '@/src/hooks/useAuth';
import { useProfile } from '@/src/hooks/useProfile';
import { useWeightLogs } from '@/src/hooks/useWeightLogs';
import type { Profile, TdeeCalculationResponse } from '@/src/types/api';

type TargetMode = 'grams' | 'percentages';
type OpenModal = 'details' | 'goals' | 'targetWeight' | 'tdee' | null;
type MacroKey = 'protein' | 'carbs' | 'fats';

const CALORIES_PER_GRAM: Record<MacroKey, number> = {
  protein: 4,
  carbs: 4,
  fats: 9,
};

function numberValue(value: string): number {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

type SettingButtonProps = {
  title: string;
  description: string;
  onPress: () => void;
  buttonLabel?: string;
};

  function SettingButton({
  title,
  description,
  onPress,
  buttonLabel = 'Edit',
}: SettingButtonProps) {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-white/10 bg-[#232220] p-3.5">
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-black text-white">{title}</Text>
        <Text className="mt-0.5 text-sm leading-5 text-white/45">{description}</Text>
      </View>
      <Button label={buttonLabel} size="compact" variant="outline" onPress={onPress} />
    </View>
  );
}

export function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { profile, isLoading, isSaving, error, save } = useProfile();
  const { data: weightData } = useWeightLogs();
  const [openModal, setOpenModal] = useState<OpenModal>(null);
  const [displayName, setDisplayName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);
  const [targetWeight, setTargetWeight] = useState('');
  const [mode, setMode] = useState<TargetMode>('grams');
  const [saved, setSaved] = useState(false);

  function setGoalDrafts(source: Profile, targetMode: TargetMode) {
    setCalories(Math.round(source.daily_calorie_target).toString());
    if (targetMode === 'grams') {
      setProtein(Math.round(source.daily_protein_target));
      setCarbs(Math.round(source.daily_carbs_target));
      setFats(Math.round(source.daily_fats_target));
    } else {
      setProtein(Math.round(source.protein_percentage));
      setCarbs(Math.round(source.carbs_percentage));
      setFats(Math.round(source.fats_percentage));
    }
  }

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name ?? '');
    setMode('grams');
    setCalories(Math.round(profile.daily_calorie_target).toString());
    setProtein(Math.round(profile.daily_protein_target));
    setCarbs(Math.round(profile.daily_carbs_target));
    setFats(Math.round(profile.daily_fats_target));
    setTargetWeight(
      profile.target_weight_kg === null
        ? ''
        : String(profile.target_weight_kg),
    );
  }, [profile]);

  const calculatedCalories =
    protein * CALORIES_PER_GRAM.protein +
    carbs * CALORIES_PER_GRAM.carbs +
    fats * CALORIES_PER_GRAM.fats;
  const percentageTotal = protein + carbs + fats;
  const percentageTotalValid = percentageTotal === 100;
  const detailsValid = displayName.trim().length >= 2;
  const targetWeightValue = numberValue(targetWeight);
  const targetWeightValid =
    !targetWeight.trim() ||
    (targetWeightValue >= 20 && targetWeightValue <= 500);
  const goalsValid =
    protein >= 0 &&
    carbs >= 0 &&
    fats >= 0 &&
    (mode === 'grams'
      ? calculatedCalories > 0
      : numberValue(calories) > 0 &&
        numberValue(calories) <= 20_000 &&
        percentageTotalValid);

  function closeModal() {
    if (isSaving) return;
    setOpenModal(null);
  }

  function openDetails() {
    if (!profile) return;
    setSaved(false);
    setDisplayName(profile.display_name ?? '');
    setOpenModal('details');
  }

  function openGoals() {
    if (!profile) return;
    setSaved(false);
    setGoalDrafts(profile, mode);
    setOpenModal('goals');
  }

  function openTargetWeight() {
    if (!profile) return;
    setSaved(false);
    setTargetWeight(
      profile.target_weight_kg === null
        ? ''
        : String(profile.target_weight_kg),
    );
    setOpenModal('targetWeight');
  }

  function changeMode(nextMode: TargetMode) {
    if (nextMode === mode) return;
    const calorieTarget = numberValue(calories);
    if (nextMode === 'percentages') {
      if (calculatedCalories > 0) {
        const nextProtein = Math.round((protein * 4 * 100) / calculatedCalories);
        const nextCarbs = Math.round((carbs * 4 * 100) / calculatedCalories);
        setProtein(nextProtein);
        setCarbs(nextCarbs);
        setFats(100 - nextProtein - nextCarbs);
        setCalories(Math.round(calculatedCalories).toString());
      }
    } else if (calorieTarget > 0) {
      setProtein(Math.round((calorieTarget * protein) / 100 / 4));
      setCarbs(Math.round((calorieTarget * carbs) / 100 / 4));
      setFats(Math.round((calorieTarget * fats) / 100 / 9));
    }
    setMode(nextMode);
  }

  async function saveDetails() {
    if (!profile) return;
    const didSave = await save({
      display_name: displayName.trim(),
      daily_calorie_target: profile.daily_calorie_target,
      target_mode: 'grams',
      protein: profile.daily_protein_target,
      carbs: profile.daily_carbs_target,
      fats: profile.daily_fats_target,
      target_weight_kg: profile.target_weight_kg,
    });
    if (didSave) {
      setSaved(true);
      setOpenModal(null);
    }
  }

  async function saveGoals() {
    if (!profile) return;
    const didSave = await save({
      display_name:
        profile.display_name?.trim() || profile.email.split('@')[0] || 'Caliper user',
      daily_calorie_target:
        mode === 'grams' ? calculatedCalories : numberValue(calories),
      target_mode: mode,
      protein,
      carbs,
      fats,
      target_weight_kg: profile.target_weight_kg,
    });
    if (didSave) {
      setSaved(true);
      setOpenModal(null);
    }
  }

  async function saveTargetWeight() {
    if (!profile || !targetWeightValid) return;
    const didSave = await save({
      display_name:
        profile.display_name?.trim() ||
        profile.email.split('@')[0] ||
        'Caliper user',
      daily_calorie_target: profile.daily_calorie_target,
      target_mode: 'grams',
      protein: profile.daily_protein_target,
      carbs: profile.daily_carbs_target,
      fats: profile.daily_fats_target,
      target_weight_kg: targetWeight.trim() ? targetWeightValue : null,
    });
    if (didSave) {
      setSaved(true);
      setOpenModal(null);
    }
  }

  return (
    <>
      <ScrollbarContainer
        className="flex-1 bg-brand"
        contentContainerClassName="px-5 pb-20 pt-5">
        <AppPage>
          <PageHeader
            title="Profile"
            description="Your account and nutrition preferences."
            action={
              <Pressable
                accessibilityLabel="Sign out"
                className="h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#232220]"
                onPress={() => void signOut()}>
                <LogOut color="#FFFFFF" size={16} />
              </Pressable>
            }
          />

          {isLoading && !profile ? (
            <View className="items-center py-24">
              <LoadingSpinner />
            </View>
          ) : (
            <View className="mt-6 gap-3.5">
              <View className="items-center rounded-3xl border border-white/10 bg-[#232220] p-5">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-fats">
                  <UserRound color="#121212" size={28} />
                </View>
                <Text className="mt-3 text-lg font-black text-white">
                  {profile?.display_name || 'Your profile'}
                </Text>
                <Text className="mt-0.5 text-sm text-white/45">{profile?.email}</Text>
              </View>

              <SettingButton
                title="Edit details"
                description="Update your display name and review your email."
                onPress={openDetails}
              />
              <SettingButton
                title="Daily goals"
                description={`${Math.round(
                  profile?.daily_calorie_target ?? 0,
                )} kcal, ${Math.round(
                  profile?.daily_protein_target ?? 0,
                )}g protein, ${Math.round(
                  profile?.daily_carbs_target ?? 0,
                )}g carbs, ${Math.round(profile?.daily_fats_target ?? 0)}g fat`}
                onPress={openGoals}
              />
              <SettingButton
                title="TDEE calculator"
                description="Estimate maintenance calories and apply automatic macro goals."
                buttonLabel="Calculate"
                onPress={() => setOpenModal('tdee')}
              />
              <SettingButton
                title="Target weight"
                description={
                  profile?.target_weight_kg
                    ? `${profile.target_weight_kg.toFixed(1)} kg`
                    : 'Not set. Add one to enable target-date projections.'
                }
                onPress={openTargetWeight}
              />
              <SettingButton
                title="Weight tracker"
                description="Log weigh-ins and follow your progress over time."
                buttonLabel="Open"
                onPress={() => router.push('/weight')}
              />
              <SettingButton
                title="Nutrition"
                description="View your calorie and macro stats over time."
                buttonLabel="View"
                onPress={() => router.push('/nutrition')}
              />

              {error && !openModal ? (
                <AnimatedPresence className="rounded-2xl bg-dangerSoft p-3.5">
                  <Text className="font-semibold text-danger">{error}</Text>
                </AnimatedPresence>
              ) : null}
              {saved ? (
                <AnimatedPresence className="rounded-2xl bg-successSoft p-3.5">
                  <Text className="font-semibold text-brand">Profile saved.</Text>
                </AnimatedPresence>
              ) : null}
            </View>
          )}
        </AppPage>
      </ScrollbarContainer>

      <ModalWrapper
        isOpen={openModal === 'details'}
        onClose={closeModal}>
        <ModalHeader
          title="Edit details"
          description="Change the name shown throughout Caliper."
          onClose={closeModal}
        />
        <View className="gap-5 p-5">
          <View className="gap-1.5">
            <Text className="pl-2 text-sm font-bold text-white/70">Display name</Text>
            <InputBox
              accessibilityLabel="Display name"
              compact
              onChangeText={setDisplayName}
              placeholder="Your name"
              placeholderTextColor="#777777"
              value={displayName}
            />
          </View>
          <View className="gap-1.5">
            <Text className="pl-2 text-sm font-bold text-white/70">Email</Text>
            <View className="min-h-14 justify-center rounded-2xl border border-white/5 bg-[#151515] px-4 opacity-60">
              <Text className="text-base text-white">{profile?.email}</Text>
            </View>
          </View>
          {error ? (
            <AnimatedPresence className="rounded-2xl bg-dangerSoft p-4">
              <Text className="font-semibold text-danger">{error}</Text>
            </AnimatedPresence>
          ) : null}
          <View className="gap-3">
            <Button
              label="Save details"
              disabled={!detailsValid}
              loading={isSaving}
              onPress={() => void saveDetails()}
            />
            <Button
              label="Cancel"
              variant="secondary"
              disabled={isSaving}
              onPress={closeModal}
            />
          </View>
        </View>
      </ModalWrapper>

      <TdeeCalculatorModal
        initialWeightKg={weightData?.latest_weight_kg}
        isOpen={openModal === 'tdee'}
        onClose={closeModal}
        onApply={async (result: TdeeCalculationResponse) => {
          if (!profile) return false;
          const didSave = await save({
            display_name:
              profile.display_name?.trim() ||
              profile.email.split('@')[0] ||
              'Caliper user',
            daily_calorie_target: result.daily_calorie_target,
            target_mode: 'grams',
            protein: result.daily_protein_target,
            carbs: result.daily_carbs_target,
            fats: result.daily_fats_target,
            target_weight_kg: profile.target_weight_kg,
          });
          if (didSave) setSaved(true);
          return didSave;
        }}
      />

      <ModalWrapper
        isOpen={openModal === 'targetWeight'}
        onClose={closeModal}>
        <ModalHeader
          title="Target weight"
          description="Set the weight used for progress and target-date projections."
          onClose={closeModal}
        />
        <View className="gap-5 p-5">
          <View className="gap-1.5">
            <Text className="pl-2 text-sm font-bold text-white/70">
              Target weight in kilograms
            </Text>
            <InputBox
              accessibilityLabel="Target weight in kilograms"
              compact
              keyboardType="decimal-pad"
              onChangeText={setTargetWeight}
              placeholder="Optional"
              placeholderTextColor="#777777"
              value={targetWeight}
            />
            <Text className="pl-2 text-xs leading-5 text-white/40">
              Leave this blank to remove your target.
            </Text>
          </View>
          {error ? (
            <AnimatedPresence className="rounded-2xl bg-dangerSoft p-4">
              <Text className="font-semibold text-danger">{error}</Text>
            </AnimatedPresence>
          ) : null}
          <View className="gap-3">
            <Button
              label="Save target"
              disabled={!targetWeightValid}
              loading={isSaving}
              onPress={() => void saveTargetWeight()}
            />
            <Button
              label="Cancel"
              variant="secondary"
              disabled={isSaving}
              onPress={closeModal}
            />
          </View>
        </View>
      </ModalWrapper>

      <ModalWrapper
        isOpen={openModal === 'goals'}
        onClose={closeModal}>
        <ModalHeader
          title="Daily goals"
          description="Set targets in grams or as percentages of calories."
          onClose={closeModal}
        />
        <ScrollbarContainer
          contentContainerClassName="gap-5 p-5"
          keyboardShouldPersistTaps="handled">
          <View className="flex-row rounded-2xl bg-[#151515] p-1">
            {(['grams', 'percentages'] as const).map((option) => (
              <Pressable
                className={`flex-1 items-center rounded-xl px-2 py-3 ${
                  mode === option ? 'bg-accent' : ''
                }`}
                key={option}
                onPress={() => changeMode(option)}>
                <Text
                  className={
                    mode === option
                      ? 'text-center font-black text-white'
                      : 'text-center font-bold text-white/50'
                  }>
                  {option === 'grams' ? 'Weight / grams' : 'Percentages'}
                </Text>
              </Pressable>
            ))}
          </View>
          {mode === 'grams' ? (
            <View className="gap-1.5">
              <View className="flex-row items-center gap-1.5 pl-2">
                <Text className="text-sm font-bold text-white/70">Calories</Text>
                <Text className="text-xs text-white/40">
                  (Auto-calculated from gram values)
                </Text>
              </View>
              <View className="relative min-h-14 justify-center rounded-2xl border border-white/10 bg-[#141414] px-4 pr-14">
                <Text className="text-lg font-black text-white">
                  {Math.round(calculatedCalories)}
                </Text>
                <View className="pointer-events-none absolute bottom-0 right-4 top-0 justify-center">
                  <Text className="text-sm font-bold text-white/40">kcal</Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="gap-1.5">
              <Text className="pl-2 text-sm font-bold text-white/70">Calories</Text>
              <View>
                <InputBox
                  accessibilityLabel="Calories"
                  compact
                  containerClassName="pr-14"
                  inputClassName="text-lg font-black"
                  keyboardType="decimal-pad"
                  onChangeText={setCalories}
                  value={calories}
                />
                <View className="pointer-events-none absolute bottom-0 right-4 top-0 justify-center">
                  <Text className="text-sm font-bold text-white/40">kcal</Text>
                </View>
              </View>
            </View>
          )}
          <View className="flex-row flex-wrap gap-3">
            <NumberSpinner
                label="Protein"
                suffix={mode === 'grams' ? 'g' : '%'}
                value={protein}
                max={mode === 'grams' ? 1000 : 200}
                onChange={setProtein}
                closing={openModal !== 'goals'}
            />
            <NumberSpinner
                label="Carbs"
                suffix={mode === 'grams' ? 'g' : '%'}
                value={carbs}
                max={mode === 'grams' ? 1500 : 200}
                onChange={setCarbs}
                closing={openModal !== 'goals'}
            />
            <NumberSpinner
                label="Fat"
                suffix={mode === 'grams' ? 'g' : '%'}
                value={fats}
                max={mode === 'grams' ? 500 : 200}
                onChange={setFats}
                closing={openModal !== 'goals'}
            />
          </View>
          {mode === 'percentages' ? (
            <Text
              className={`text-sm font-black ${
                percentageTotalValid ? 'text-white' : 'text-accent'
              }`}>
              Total: {percentageTotal}% / 100%
            </Text>
          ) : null}
          {error ? (
            <AnimatedPresence className="rounded-2xl bg-dangerSoft p-4">
              <Text className="font-semibold text-danger">{error}</Text>
            </AnimatedPresence>
          ) : null}
          <View className="gap-3">
            <Button
              label="Save goals"
              disabled={!goalsValid}
              loading={isSaving}
              onPress={() => void saveGoals()}
            />
            <Button
              label="Cancel"
              variant="secondary"
              disabled={isSaving}
              onPress={closeModal}
            />
          </View>
        </ScrollbarContainer>
      </ModalWrapper>
    </>
  );
}
