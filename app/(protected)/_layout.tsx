import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';

import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { useAuth } from '@/src/hooks/useAuth';
import { MealAnalysisProvider } from '@/src/hooks/useMealAnalysis';

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
    <MealAnalysisProvider>
      <Stack screenOptions={{ headerShown: false }}>
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
      </Stack>
    </MealAnalysisProvider>
  );
}
