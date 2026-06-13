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

function targetValue(value: number): string {
  return Number(Math.max(0, value).toFixed(1)).toString();
}

type TargetFieldProps = {
  label: string;
  suffix: string;
  value: string;
  onChange: (value: string) => void;
};

function TargetField({ label, suffix, value, onChange }: TargetFieldProps) {
  return (
    <View className="min-w-[130px] flex-1 gap-1.5">
      <Text className="pl-2 text-sm font-bold text-white/70">{label}</Text>
      <View>
        <InputBox
          accessibilityLabel={label}
          compact
          containerClassName="pr-12"
          inputClassName="font-black"
          keyboardType="decimal-pad"
          onChangeText={onChange}
          value={value}
        />
        <View
          className="pointer-events-none"
          style={{
            bottom: 0,
            justifyContent: 'center',
            position: 'absolute',
            right: 16,
            top: 0,
          }}>
          <Text className="text-sm font-bold text-white/40">{suffix}</Text>
        </View>
      </View>
    </View>
  );
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
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [mode, setMode] = useState<TargetMode>('grams');
  const [saved, setSaved] = useState(false);

  function setGoalDrafts(source: Profile, targetMode: TargetMode) {
    setCalories(Math.round(source.daily_calorie_target).toString());
    if (targetMode === 'grams') {
      setProtein(Math.round(source.daily_protein_target).toString());
      setCarbs(Math.round(source.daily_carbs_target).toString());
      setFats(Math.round(source.daily_fats_target).toString());
    } else {
      setProtein(source.protein_percentage.toFixed(1));
      setCarbs(source.carbs_percentage.toFixed(1));
      setFats(source.fats_percentage.toFixed(1));
    }
  }

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name ?? '');
    setMode('grams');
    setCalories(Math.round(profile.daily_calorie_target).toString());
    setProtein(Math.round(profile.daily_protein_target).toString());
    setCarbs(Math.round(profile.daily_carbs_target).toString());
    setFats(Math.round(profile.daily_fats_target).toString());
  }, [profile]);

  const detailsValid = displayName.trim().length >= 2;
  const goalsValid =
    numberValue(calories) > 0 &&
    numberValue(calories) <= 20_000 &&
    numberValue(protein) >= 0 &&
    numberValue(carbs) >= 0 &&
    numberValue(fats) >= 0;

  function macroValues(changed?: MacroKey, value?: number) {
    return {
      protein: changed === 'protein' ? value ?? 0 : numberValue(protein),
      carbs: changed === 'carbs' ? value ?? 0 : numberValue(carbs),
      fats: changed === 'fats' ? value ?? 0 : numberValue(fats),
    };
  }

  function setMacroValues(values: Record<MacroKey, number>) {
    setProtein(targetValue(values.protein));
    setCarbs(targetValue(values.carbs));
    setFats(targetValue(values.fats));
  }

  function setPercentageValues(values: Record<MacroKey, number>) {
    const total = values.protein + values.carbs + values.fats;
    if (total <= 0) return;
    const nextProtein = Number(((values.protein / total) * 100).toFixed(1));
    const nextCarbs = Number(((values.carbs / total) * 100).toFixed(1));
    setProtein(targetValue(nextProtein));
    setCarbs(targetValue(nextCarbs));
    setFats(targetValue(100 - nextProtein - nextCarbs));
  }

  function changeCalories(value: string) {
    setCalories(value);
    const nextCalories = numberValue(value);
    if (mode !== 'grams' || nextCalories <= 0) return;

    const current = macroValues();
    const currentCalories =
      current.protein * 4 + current.carbs * 4 + current.fats * 9;
    if (currentCalories <= 0) return;
    const ratio = nextCalories / currentCalories;
    setMacroValues({
      protein: current.protein * ratio,
      carbs: current.carbs * ratio,
      fats: current.fats * ratio,
    });
  }

  function changeMacro(key: MacroKey, value: string) {
    const nextValue = numberValue(value);
    if (mode === 'grams') {
      if (key === 'protein') setProtein(value);
      if (key === 'carbs') setCarbs(value);
      if (key === 'fats') setFats(value);
      if (!value.trim()) return;
      const next = macroValues(key, nextValue);
      setCalories(
        targetValue(
          next.protein * CALORIES_PER_GRAM.protein +
            next.carbs * CALORIES_PER_GRAM.carbs +
            next.fats * CALORIES_PER_GRAM.fats,
        ),
      );
      return;
    }

    const changedValue = Math.min(100, Math.max(0, nextValue));
    const current = macroValues();
    const otherKeys = (Object.keys(current) as MacroKey[]).filter(
      (macro) => macro !== key,
    );
    const remaining = 100 - changedValue;
    const otherTotal = otherKeys.reduce((total, macro) => total + current[macro], 0);
    const next = { ...current, [key]: changedValue };
    for (const macro of otherKeys) {
      next[macro] =
        otherTotal > 0 ? (current[macro] / otherTotal) * remaining : remaining / 2;
    }
    const firstOther = otherKeys[0];
    const secondOther = otherKeys[1];
    const roundedChanged = Number(changedValue.toFixed(1));
    const roundedFirst = Number(next[firstOther].toFixed(1));
    setMacroValues({
      ...next,
      [key]: roundedChanged,
      [firstOther]: roundedFirst,
      [secondOther]: 100 - roundedChanged - roundedFirst,
    });
  }

  function closeModal() {
    if (isSaving) return;
    if (profile) {
      setDisplayName(profile.display_name ?? '');
      setGoalDrafts(profile, mode);
    }
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
    const current = macroValues();
    if (nextMode === 'percentages') {
      const macroCalories =
        current.protein * 4 + current.carbs * 4 + current.fats * 9;
      if (macroCalories > 0) {
        setPercentageValues({
          protein: (current.protein * 4 * 100) / macroCalories,
          carbs: (current.carbs * 4 * 100) / macroCalories,
          fats: (current.fats * 9 * 100) / macroCalories,
        });
      }
    } else if (calorieTarget > 0) {
      setMacroValues({
        protein: (calorieTarget * current.protein) / 100 / 4,
        carbs: (calorieTarget * current.carbs) / 100 / 4,
        fats: (calorieTarget * current.fats) / 100 / 9,
      });
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
      daily_calorie_target: numberValue(calories),
      target_mode: mode,
      protein: numberValue(protein),
      carbs: numberValue(carbs),
      fats: numberValue(fats),
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
              <LoadingSpinner color="white" />
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
          <TargetField
            label="Calories"
            suffix="kcal"
            value={calories}
            onChange={changeCalories}
          />
          <View className="flex-row flex-wrap gap-3">
            <TargetField
              label="Protein"
              suffix={mode === 'grams' ? 'g' : '%'}
              value={protein}
              onChange={(value) => changeMacro('protein', value)}
            />
            <TargetField
              label="Carbs"
              suffix={mode === 'grams' ? 'g' : '%'}
              value={carbs}
              onChange={(value) => changeMacro('carbs', value)}
            />
            <TargetField
              label="Fat"
              suffix={mode === 'grams' ? 'g' : '%'}
              value={fats}
              onChange={(value) => changeMacro('fats', value)}
            />
          </View>
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
