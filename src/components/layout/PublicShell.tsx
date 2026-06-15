import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';

export function PublicShell({ children }: PropsWithChildren) {
  return (
    <SafeAreaView className="flex-1 bg-brand">
      <ScrollbarContainer
        contentContainerClassName="grow px-4 py-4 sm:px-6 sm:py-6"
        keyboardShouldPersistTaps="handled">
        <View className="w-full max-w-6xl flex-1 self-center">{children}</View>
      </ScrollbarContainer>
    </SafeAreaView>
  );
}
