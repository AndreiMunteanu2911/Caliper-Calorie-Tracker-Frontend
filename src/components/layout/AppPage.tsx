import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

type AppPageProps = PropsWithChildren<{
  className?: string;
}>;

export function AppPage({ children, className = '' }: AppPageProps) {
  return (
    <View
      className={`min-w-0 w-full max-w-sm self-center px-3 sm:max-w-md ${className}`}>
      {children}
    </View>
  );
}
