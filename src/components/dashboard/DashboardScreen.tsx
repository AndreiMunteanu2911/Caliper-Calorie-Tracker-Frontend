import { useRouter } from 'expo-router';
import { Check, ScanLine } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { MacroRing } from '@/src/components/dashboard/MacroRing';
import { AppPage } from '@/src/components/layout/AppPage';
import { PageHeader } from '@/src/components/layout/PageHeader';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
import { useAuth } from '@/src/hooks/useAuth';
import { useDashboardData } from '@/src/hooks/useDashboardData';
import { useProfile } from '@/src/hooks/useProfile';
import { localDateString } from '@/src/lib/dates';
import {
  MotionFade,
  MotionPressable,
  MotionProgress,
  PageSkeleton,
} from '@/src/lib/motion';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const CALORIE_RING_RADIUS = 48;
const CALORIE_RING_CIRCUMFERENCE = 2 * Math.PI * CALORIE_RING_RADIUS;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const isNative = Platform.OS !== 'web';
const RING_ANIMATION_DURATION_MS = 450;

export function DashboardScreen() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data, isLoading, error, refresh } = useDashboardData();
  const { profile } = useProfile();
  const progress = data?.progress;
  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? 'Good morning'
      : today.getHours() < 18
        ? 'Good afternoon'
        : 'Good evening';
  const mondayOffset = (today.getDay() + 6) % 7;
  const caloriePercentage = progress?.targets.calories
    ? Math.min(progress.consumed.calories / progress.targets.calories, 1)
    : 0;
  const [calorieBarWidth, setCalorieBarWidth] = useState(0);
  const [webCalorieRingPercentage, setWebCalorieRingPercentage] = useState(0);
  const calorieBarRef = useRef<View>(null);
  const calorieRingProgress = useRef(new Animated.Value(0)).current;
  const webCalorieRingPercentageRef = useRef(0);
  const calorieRingDashOffset = calorieRingProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [
      CALORIE_RING_CIRCUMFERENCE,
      CALORIE_RING_CIRCUMFERENCE * (1 - caloriePercentage),
    ],
  });

  useEffect(() => {
    Animated.timing(calorieRingProgress, {
      duration: RING_ANIMATION_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      toValue: caloriePercentage,
      useNativeDriver: false,
    }).start();
  }, [caloriePercentage, calorieRingProgress]);

  useEffect(() => {
    if (isNative) return;

    let animationFrame = 0;
    let startTime = 0;
    const startValue = webCalorieRingPercentageRef.current;
    const change = caloriePercentage - startValue;

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / RING_ANIMATION_DURATION_MS, 1);
      const eased = 1 - (1 - progress) ** 3;
      const nextValue = startValue + change * eased;
      webCalorieRingPercentageRef.current = nextValue;
      setWebCalorieRingPercentage(nextValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    }

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [caloriePercentage]);

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
      contentContainerClassName="pb-32 pt-4 sm:pt-5"
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
          description={`${greeting}${
            profile?.display_name
              ? `, ${profile.display_name}`
              : user?.email
                ? `, ${user.email.split('@')[0]}`
                : ''
          }. Here is your progress for today.`}
        />

        <View className="mt-4 flex-row items-center justify-between rounded-xl bg-white px-1.5 py-2.5">
          {WEEK_DAYS.map((day, index) => {
            const date = new Date(today);
            date.setDate(today.getDate() - mondayOffset + index);
            const isToday = index === mondayOffset;
            const isLogged = data?.logged_dates.includes(localDateString(date));
            return (
              <View className="flex-1 items-center gap-1" key={day}>
                <Text className="text-xs font-semibold text-ink/80">{day}</Text>
                <View
                  className={`relative h-8 w-8 items-center justify-center rounded-full ${
                    isToday ? 'bg-fats' : ''
                  }`}>
                  <Text className="text-xs font-black text-ink">{date.getDate()}</Text>
                  {isLogged ? (
                    <MotionFade
                      className="absolute -bottom-1 -right-1 h-4 w-4 items-center justify-center rounded-full bg-accent"
                      distance={2}>
                      <View className="h-4 w-full items-center justify-center">
                        <Check color="#FFFFFF" size={10} strokeWidth={3} />
                      </View>
                    </MotionFade>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>

        <Text className="mb-3 mt-5 text-base font-black tracking-tight text-white sm:text-lg">
          Count Your Daily Calories
        </Text>

        {error && !progress ? (
          <Pressable
            className="rounded-2xl border border-danger/40 bg-[#232220] p-3.5"
            onPress={() => void refresh()}>
            <Text className="text-sm font-black text-white">Dashboard unavailable</Text>
            <Text className="mt-1 text-sm text-white/55">{error}. Tap to try again.</Text>
          </Pressable>
        ) : progress ? (
          <View className="gap-3">
            <View className="rounded-2xl bg-fats p-3.5">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-black text-ink">Calories remaining</Text>
              </View>
              <View className="my-4 items-center">
                <View className="h-28 w-28 items-center justify-center">
                  <Svg
                    height={112}
                    style={StyleSheet.absoluteFill}
                    viewBox="0 0 112 112"
                    width={112}>
                    <Circle
                      cx={56}
                      cy={56}
                      fill="none"
                      r={CALORIE_RING_RADIUS}
                      stroke="#101010"
                      strokeOpacity={0.1}
                      strokeWidth={8}
                    />
                    {isNative ? (
                      <AnimatedCircle
                        cx={56}
                        cy={56}
                        fill="none"
                        r={CALORIE_RING_RADIUS}
                        stroke="#101010"
                        strokeDasharray={CALORIE_RING_CIRCUMFERENCE}
                        strokeDashoffset={calorieRingDashOffset as unknown as number}
                        strokeLinecap="round"
                        strokeWidth={8}
                        transform="rotate(-90 56 56)"
                      />
                    ) : (
                      <Circle
                        cx={56}
                        cy={56}
                        fill="none"
                        r={CALORIE_RING_RADIUS}
                        stroke="#101010"
                        strokeDasharray={CALORIE_RING_CIRCUMFERENCE}
                        strokeDashoffset={
                          CALORIE_RING_CIRCUMFERENCE *
                          (1 - webCalorieRingPercentage)
                        }
                        strokeLinecap="round"
                        strokeWidth={8}
                        transform="rotate(-90 56 56)"
                      />
                    )}
                  </Svg>
                  <Text className="text-2xl font-black text-ink">
                    {Math.max(0, Math.round(progress.remaining.calories))}
                  </Text>
                  <Text className="mt-0.5 text-xs text-ink/65">Left</Text>
                </View>
              </View>
              <View
                className="h-1 overflow-hidden rounded-full bg-brand/10"
                ref={calorieBarRef}
                onLayout={(e) => setCalorieBarWidth(e.nativeEvent.layout.width)}>
                <View className="h-full" style={{ width: calorieBarWidth }}>
                  <MotionProgress
                    progress={caloriePercentage}
                    style={{ backgroundColor: '#101010', borderRadius: 999 }}
                  />
                </View>
              </View>
              <View className="mt-2 flex-row justify-between">
                <Text className="text-xs font-semibold text-ink/60">
                  {Math.round(progress.consumed.calories)} eaten
                </Text>
                <Text className="text-xs font-semibold text-ink/60">
                  {Math.round(progress.targets.calories)} goal
                </Text>
              </View>
            </View>

            <View className="flex-row items-stretch gap-2.5">
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
            <View className="flex-row gap-2.5">
              <MacroRing
                consumed={progress.consumed.fats}
                label="Fat"
                softColorClass="bg-accent"
                target={progress.targets.fats}
              />
              <MotionPressable
                className="h-full min-w-0 justify-between rounded-2xl bg-[#232220] p-3"
                containerClassName="min-w-0 flex-1 self-stretch"
                fill
                lift
                onPress={() => router.push('/scan')}>
                <View className="h-9 w-9 items-center justify-center rounded-full bg-accent">
                  <ScanLine color="#FFFFFF" size={18} />
                </View>
                <View className="mt-5">
                  <Text className="text-base font-black text-white">Log a meal</Text>
                  <Text className="mt-1 text-xs text-white/50">Scan, search or take a photo</Text>
                </View>
              </MotionPressable>
            </View>
          </View>
        ) : (
          <PageSkeleton />
        )}
      </AppPage>
    </ScrollbarContainer>
  );
}
