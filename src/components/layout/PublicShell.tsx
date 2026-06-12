import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function PublicShell({ children }: PropsWithChildren) {
  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <View
        className="flex-1 items-center justify-center px-5 py-8">
        <View className="w-full max-w-md">{children}</View>
      </View>
    </SafeAreaView>
  );
}
