import { useRouter } from 'expo-router';
import { LogOut, ScanLine } from 'lucide-react-native';
import { Pressable, RefreshControl, Text, View } from 'react-native';

import { MacroRing } from '@/src/components/dashboard/MacroRing';
import { AppPage } from '@/src/components/layout/AppPage';
import { PageHeader } from '@/src/components/layout/PageHeader';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
import { useAuth } from '@/src/hooks/useAuth';
import { useDashboardData } from '@/src/hooks/useDashboardData';
import { useProfile } from '@/src/hooks/useProfile';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export function DashboardScreen() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, signOut } = useAuth();
  const { data, isLoading, error, refresh } = useDashboardData();
  const { profile } = useProfile();
  const progress = data?.progress;
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  const caloriePercentage = progress?.targets.calories
    ? Math.min(progress.consumed.calories / progress.targets.calories, 1)
    : 0;

  if (isAuthLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-brand">
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <ScrollbarContainer
      className="flex-1 bg-brand"
      contentContainerClassName="px-5 pb-32 pt-6"
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refresh}
          tintColor="#FF5A16"
        />
      }>
      <AppPage>
        <PageHeader
          title="Your nutrition"
          description={`Good morning${
            profile?.display_name
              ? `, ${profile.display_name}`
              : user?.email
                ? `, ${user.email.split('@')[0]}`
                : ''
          }. Here is your progress for today.`}
          action={
            <Pressable
              accessibilityLabel="Sign out"
              className="h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#232220]"
              onPress={() => void signOut()}>
              <LogOut color="#FFFFFF" size={18} />
            </Pressable>
          }
        />

        <View className="mt-7 flex-row items-center justify-between rounded-[24px] bg-white px-2 py-4">
          {WEEK_DAYS.map((day, index) => {
            const date = new Date(today);
            date.setDate(today.getDate() - mondayOffset + index);
            const isToday = index === mondayOffset;
            return (
              <View className="flex-1 items-center gap-2" key={day}>
                <Text className="text-xs font-semibold text-ink/80">{day}</Text>
                <View
                  className={`h-10 w-10 items-center justify-center rounded-full ${
                    isToday ? 'bg-fats' : ''
                  }`}>
                  <Text className="text-sm font-black text-ink">{date.getDate()}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <Text className="mb-5 mt-8 text-[26px] font-black tracking-[-1px] text-white">
          Count Your Daily Calories
        </Text>

        {error && !progress ? (
          <Pressable
            className="rounded-[28px] border border-danger/40 bg-[#232220] p-7"
            onPress={() => void refresh()}>
            <Text className="text-xl font-black text-white">Dashboard unavailable</Text>
            <Text className="mt-2 text-white/55">{error}. Tap to try again.</Text>
          </Pressable>
        ) : progress ? (
          <View className="gap-4">
            <View className="rounded-[28px] bg-fats p-6">
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-black text-ink">Calories remaining</Text>
              </View>
              <View className="my-7 items-center">
                <View className="h-44 w-44 items-center justify-center rounded-full border-[18px] border-brand">
                  <Text className="text-4xl font-black text-ink">
                    {Math.max(0, Math.round(progress.remaining.calories))}
                  </Text>
                  <Text className="mt-1 text-sm text-ink/65">Left</Text>
                </View>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-brand/10">
                <View
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${caloriePercentage * 100}%` }}
                />
              </View>
              <View className="mt-3 flex-row justify-between">
                <Text className="text-xs font-semibold text-ink/60">
                  {Math.round(progress.consumed.calories)} eaten
                </Text>
                <Text className="text-xs font-semibold text-ink/60">
                  {Math.round(progress.targets.calories)} goal
                </Text>
              </View>
            </View>

            <View className="flex-row gap-4">
              <MacroRing
                consumed={progress.consumed.carbs}
                label="Carbs"
                softColorClass="bg-carbs"
                target={progress.targets.carbs}
              />
              <MacroRing
                consumed={progress.consumed.protein}
                label="Protein"
                softColorClass="bg-protein"
                target={progress.targets.protein}
              />
            </View>
            <View className="flex-row gap-4">
              <MacroRing
                consumed={progress.consumed.fats}
                label="Fat"
                softColorClass="bg-accent"
                target={progress.targets.fats}
              />
              <Pressable
                className="min-w-0 flex-1 justify-between rounded-[28px] bg-[#232220] p-5"
                onPress={() => router.push('/scan')}>
                <View className="h-11 w-11 items-center justify-center rounded-full bg-accent">
                  <ScanLine color="#FFFFFF" size={21} />
                </View>
                <View className="mt-8">
                  <Text className="text-xl font-black text-white">Log a meal</Text>
                  <Text className="mt-2 text-sm text-white/50">Scan, search or take a photo</Text>
                </View>
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="items-center py-20">
            <LoadingSpinner  />
          </View>
        )}
      </AppPage>
    </ScrollbarContainer>
  );
}
