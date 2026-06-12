import { Redirect, Slot } from 'expo-router';
import { View } from 'react-native';

import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { useAuth } from '@/src/hooks/useAuth';

export default function ProtectedLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <LoadingSpinner size="large" />
      </View>
    );
  }
  if (!user) {
    return <Redirect href="/" />;
  }
  return <Slot />;
}
