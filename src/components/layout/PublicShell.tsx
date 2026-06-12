import type { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function PublicShell({ children }: PropsWithChildren) {
  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <ScrollView
        contentContainerClassName="px-4 py-5 sm:px-6 sm:py-8 lg:min-h-full lg:justify-center"
        keyboardShouldPersistTaps="handled">
        <View className="w-full max-w-6xl self-center">{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
