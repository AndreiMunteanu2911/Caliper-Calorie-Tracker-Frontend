import type { PropsWithChildren } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppPage } from '@/src/components/layout/AppPage';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';

export function PublicShell({ children }: PropsWithChildren) {
  return (
    <SafeAreaView className="flex-1 bg-brand">
      <ScrollbarContainer
        contentContainerClassName="grow py-5 sm:py-6"
        keyboardShouldPersistTaps="handled">
        <AppPage className="flex-1">{children}</AppPage>
      </ScrollbarContainer>
    </SafeAreaView>
  );
}
