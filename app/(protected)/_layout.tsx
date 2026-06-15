import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';

import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { useAuth } from '@/src/hooks/useAuth';
import { MealAnalysisProvider } from '@/src/hooks/useMealAnalysis';
import {
  OnboardingProvider,
  useOnboarding,
} from '@/src/hooks/useOnboarding';

export default function ProtectedLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-brand">
        <LoadingSpinner size="large" />
      </View>
    );
  }
  if (!user) {
    return <Redirect href="/" />;
  }
  return (
    <OnboardingProvider>
      <ProtectedNavigator />
    </OnboardingProvider>
  );
}

function ProtectedNavigator() {
  const { profile, isLoading, error } = useOnboarding();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-brand">
        <LoadingSpinner size="large" />
      </View>
    );
  }
  if (error && !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-brand px-6">
        <LoadingSpinner size="large" />
      </View>
    );
  }
  const requiresOnboarding = profile?.onboarding_status === 'pending';

  return (
    <MealAnalysisProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={requiresOnboarding}>
          <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!requiresOnboarding}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="meal-camera"
            options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
          />
          <Stack.Screen
            name="barcode-camera"
            options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
          />
          <Stack.Screen
            name="food-detail"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="custom-foods"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="nutrition"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="weight"
            options={{ animation: 'slide_from_right' }}
          />
        </Stack.Protected>
      </Stack>
    </MealAnalysisProvider>
  );
}
