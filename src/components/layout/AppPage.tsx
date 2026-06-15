import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

import { MotionPage } from '@/src/lib/motion';

type AppPageProps = PropsWithChildren<{
  className?: string;
}>;

export function AppPage({ children, className = '' }: AppPageProps) {
  const fill = className.includes('flex-1');

  return (
    <View
      className={`min-w-0 w-full max-w-sm self-center px-3 sm:max-w-md ${className}`}>
      <MotionPage fill={fill}>{children}</MotionPage>
    </View>
  );
}
