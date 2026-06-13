import { Redirect, useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { PageHead } from '@/src/components/layout/PageHead';
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
        <LoadingSpinner size="large" />
      </View>
    );
  }
  if (user) return <Redirect href="/dashboard" />;

  return (
    <>
      <PageHead title="Nutrition Tracker" />
      <PublicShell>
        <View className="w-full max-w-md flex-1 self-center justify-between">
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-5xl font-black tracking-[-2.5px] text-white">
              Cali<Text className="text-accent">per</Text>
            </Text>
            <View className="mt-10 items-center">
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl font-bold text-white">Eating</Text>
                <View className="rounded-full bg-accent px-4 py-2">
                  <Text className="text-2xl font-bold text-white">healthy</Text>
                </View>
              </View>
              <Text className="mt-1 text-2xl font-bold text-white">made easy!</Text>
            </View>
          </View>

          <View className="gap-3 pb-4 pt-8">
            <Button label="Log In" onPress={() => router.push('/sign-in')} />
            <Button
              label="Sign Up"
              variant="secondary"
              onPress={() => router.push('/sign-up')}
            />
          </View>
        </View>
      </PublicShell>
    </>
  );
}
