import { Redirect, useRouter } from 'expo-router';
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
      <PublicShell>
        <LoadingSpinner size="large" />
      </PublicShell>
    );
  }
  if (user) {
    return <Redirect href="/dashboard" />;
  }

  return (
    <PublicShell>
      <View className="gap-10">
        <BrandMark />
        <View className="gap-5">
          <View className="self-start rounded-full bg-accentSoft px-4 py-2">
            <Text className="text-xs font-black uppercase tracking-[2px] text-brand">
              Nutrition, made practical
            </Text>
          </View>
          <Text className="text-5xl font-black leading-[54px] tracking-tight text-ink">
            Eat with intent. Train with confidence.
          </Text>
          <Text className="max-w-sm text-lg leading-7 text-muted">
            Track meals, scan products, analyze meal photos, and get daily guidance
            based on the macros you actually have left.
          </Text>
        </View>

        <View className="gap-3">
          <Button
            label="Create free account"
            onPress={() => router.push('/sign-up')}
          />
          <Button
            label="Sign in"
            variant="secondary"
            onPress={() => router.push('/sign-in')}
          />
        </View>

        <View className="flex-row gap-3">
          {['Barcode search', 'Meal analysis', 'Live coaching'].map((label) => (
            <View className="flex-1 rounded-2xl bg-surface p-3" key={label}>
              <View className="mb-3 h-2 w-8 rounded-full bg-accent" />
              <Text className="text-xs font-bold leading-4 text-ink">{label}</Text>
            </View>
          ))}
        </View>
      </View>
    </PublicShell>
  );
}
