import type { PropsWithChildren } from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MotionPage } from '@/src/lib/motion';

type AppPageProps = PropsWithChildren<{
  className?: string;
}>;

export function AppPage({ children, className = '' }: AppPageProps) {
  const fill = className.includes('flex-1');
  const insets = useSafeAreaInsets();
  const widthClassName =
    Platform.OS === 'web' ? 'max-w-sm sm:max-w-md' : '';

  return (
    <View
      className={`min-w-0 w-full self-center px-3 ${widthClassName} ${className}`}
      style={Platform.OS === 'web' ? undefined : { paddingTop: insets.top }}>
      <MotionPage fill={fill}>{children}</MotionPage>
    </View>
  );
}
