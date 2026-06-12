import { Redirect, useRouter } from 'expo-router';
import {
  ArrowRight,
  Barcode,
  Camera,
  Check,
  MessageCircleMore,
  Sparkles,
} from 'lucide-react-native';
import { Text, View } from 'react-native';

import { BrandMark } from '@/src/components/layout/BrandMark';
import { PublicShell } from '@/src/components/layout/PublicShell';
import { Button } from '@/src/components/ui/Button';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { useAuth } from '@/src/hooks/useAuth';

export default function WelcomeRoute() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-brand">
        <LoadingSpinner color="white" size="large" />
      </View>
    );
  }
  if (user) {
    return <Redirect href="/dashboard" />;
  }

  return (
    <PublicShell>
      <View className="gap-5">
        <View className="flex-row items-center justify-between">
          <BrandMark />
          <Button
            label="Sign in"
            size="compact"
            variant="secondary"
            onPress={() => router.push('/sign-in')}
          />
        </View>

        <View className="overflow-hidden rounded-[32px] bg-brand shadow-card lg:min-h-[590px] lg:flex-row">
          <View className="flex-1 justify-between p-7 sm:p-10 lg:p-14">
            <View>
              <View className="self-start rounded-full bg-white/10 px-4 py-2">
                <Text className="text-xs font-black uppercase tracking-[2px] text-carbs">
                  Nutrition that knows your day
                </Text>
              </View>
              <Text className="mt-7 max-w-2xl text-5xl font-black leading-[52px] tracking-[-3px] text-white sm:text-6xl sm:leading-[64px]">
                Eat smarter.{'\n'}Feel stronger.
              </Text>
              <Text className="mt-5 max-w-xl text-lg leading-7 text-white/65">
                Log food in seconds, analyze meals with your camera, and get advice
                grounded in what you actually ate.
              </Text>
              <View className="mt-8 w-full max-w-xs">
                <Button
                  label="Start tracking free"
                  icon={ArrowRight}
                  onPress={() => router.push('/sign-up')}
                />
              </View>
            </View>

            <View className="mt-12 flex-row flex-wrap gap-5">
              {[
                { icon: Barcode, label: 'Barcode scan' },
                { icon: Camera, label: 'Meal camera' },
                { icon: MessageCircleMore, label: 'AI guidance' },
              ].map(({ icon: Icon, label }) => (
                <View className="flex-row items-center gap-2" key={label}>
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-white/10">
                    <Icon color="#4CCB91" size={15} strokeWidth={2.5} />
                  </View>
                  <Text className="text-sm font-bold text-white/70">{label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="relative min-h-[430px] overflow-hidden bg-protein p-6 lg:w-[42%]">
            <View className="absolute -right-16 -top-12 h-64 w-64 rounded-full border-[38px] border-brand/10" />
            <View className="absolute -bottom-14 -left-14 h-48 w-48 rounded-full bg-carbs" />
            <View className="mx-auto mt-5 w-full max-w-sm rounded-[32px] bg-brand p-5 shadow-card lg:mt-12">
              <View className="flex-row items-center justify-between">
                <Text className="font-black text-white">Today</Text>
                <View className="flex-row items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
                  <Check color="#4CCB91" size={13} strokeWidth={2.8} />
                  <Text className="text-xs font-bold text-white/70">On track</Text>
                </View>
              </View>
              <View className="mt-5 rounded-[24px] bg-fatsSoft p-5">
                <Text className="text-sm font-bold text-brand">Calories left</Text>
                <Text className="mt-3 text-5xl font-black tracking-[-3px] text-brand">
                  1,672
                </Text>
                <View className="mt-5 h-2 overflow-hidden rounded-full bg-brand/10">
                  <View className="h-full w-2/3 rounded-full bg-brand" />
                </View>
              </View>
              <View className="mt-3 flex-row gap-3">
                <View className="flex-1 rounded-[20px] bg-carbs p-4">
                  <Text className="text-xs font-bold text-brand/60">Carbs</Text>
                  <Text className="mt-4 text-xl font-black text-brand">140g</Text>
                </View>
                <View className="flex-1 rounded-[20px] bg-protein p-4">
                  <Text className="text-xs font-bold text-brand/60">Protein</Text>
                  <Text className="mt-4 text-xl font-black text-brand">92g</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-3">
          {[
            ['01', 'Fast to log'],
            ['02', 'Easy to understand'],
            ['03', 'Personal to your history'],
          ].map(([number, label]) => (
            <View
              className="w-full flex-row items-center gap-4 rounded-[20px] border border-line bg-surface p-5 shadow-soft sm:min-w-[210px] sm:flex-1"
              key={label}>
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-accentSoft">
                <Sparkles color="#FF5A2F" size={16} strokeWidth={2.5} />
              </View>
              <Text className="text-xs font-black text-accent">{number}</Text>
              <Text className="text-sm font-black leading-5 text-ink">{label}</Text>
            </View>
          ))}
        </View>
      </View>
    </PublicShell>
  );
}
