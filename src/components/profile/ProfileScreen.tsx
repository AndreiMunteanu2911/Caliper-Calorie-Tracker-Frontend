import {
  LogOut,
  UserRound,
  X,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AppPage } from '@/src/components/layout/AppPage';
import { PageHeader } from '@/src/components/layout/PageHeader';
import { AnimatedPresence } from '@/src/components/ui/AnimatedPresence';
import { Button } from '@/src/components/ui/Button';
import { InputBox } from '@/src/components/ui/InputBox';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ModalWrapper } from '@/src/components/ui/ModalWrapper';
import { NumberSpinner } from '@/src/components/ui/NumberSpinner';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
import { useAuth } from '@/src/hooks/useAuth';
import { useProfile } from '@/src/hooks/useProfile';
import type { Profile } from '@/src/types/api';

type TargetMode = 'grams' | 'percentages';
type OpenModal = 'details' | 'goals' | null;
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
};

function SettingButton({
  title,
  description,
  onPress,
}: SettingButtonProps) {
  return (
    <View className="flex-row items-center gap-4 rounded-[24px] border border-white/10 bg-[#232220] p-4">
      <View className="min-w-0 flex-1">
        <Text className="text-base font-black text-white">{title}</Text>
        <Text className="mt-1 text-sm leading-5 text-white/45">{description}</Text>
      </View>
      <Button label="Edit" size="compact" variant="outline" onPress={onPress} />
    </View>
  );
}

function ModalHeader({
  title,
  description,
  onClose,
}: {
  title: string;
  description: string;
  onClose: () => void;
}) {
  return (
    <View className="flex-row items-start gap-4 border-b border-white/10 px-5 py-5">
      <View className="min-w-0 flex-1">
        <Text className="text-2xl font-black text-white">{title}</Text>
        <Text className="mt-1 text-sm leading-5 text-white/50">{description}</Text>
      </View>
      <Pressable
        accessibilityLabel="Close"
        className="h-10 w-10 items-center justify-center rounded-full bg-white/5"
        onPress={onClose}>
        <X color="#FFFFFF" size={18} />
      </Pressable>
    </View>
  );
}

export function ProfileScreen() {
  const { signOut } = useAuth();
  const { profile, isLoading, isSaving, error, save } = useProfile();
  const [openModal, setOpenModal] = useState<OpenModal>(null);
  const [displayName, setDisplayName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);
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
  }, [profile]);

  const calculatedCalories =
    protein * CALORIES_PER_GRAM.protein +
    carbs * CALORIES_PER_GRAM.carbs +
    fats * CALORIES_PER_GRAM.fats;
  const percentageTotal = protein + carbs + fats;
  const percentageTotalValid = percentageTotal === 100;
  const detailsValid = displayName.trim().length >= 2;
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
        contentContainerClassName="px-5 pb-32 pt-6">
        <AppPage>
          <PageHeader
            title="Profile"
            description="Your account and nutrition preferences."
            action={
              <Pressable
                accessibilityLabel="Sign out"
                className="h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#232220]"
                onPress={() => void signOut()}>
                <LogOut color="#FFFFFF" size={18} />
              </Pressable>
            }
          />

          {isLoading && !profile ? (
            <View className="items-center py-24">
              <LoadingSpinner />
            </View>
          ) : (
            <View className="mt-8 gap-4">
              <View className="items-center rounded-[28px] border border-white/10 bg-[#232220] p-6">
                <View className="h-20 w-20 items-center justify-center rounded-full bg-fats">
                  <UserRound color="#121212" size={34} />
                </View>
                <Text className="mt-4 text-xl font-black text-white">
                  {profile?.display_name || 'Your profile'}
                </Text>
                <Text className="mt-1 text-sm text-white/45">{profile?.email}</Text>
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

              {error && !openModal ? (
                <AnimatedPresence className="rounded-2xl bg-dangerSoft p-4">
                  <Text className="font-semibold text-danger">{error}</Text>
                </AnimatedPresence>
              ) : null}
              {saved ? (
                <AnimatedPresence className="rounded-2xl bg-successSoft p-4">
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
            <View className="min-h-14 justify-center rounded-[18px] border border-white/5 bg-[#151515] px-4 opacity-60">
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
              <View className="relative min-h-14 justify-center rounded-[18px] border border-white/10 bg-[#141414] px-4 pr-14">
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
