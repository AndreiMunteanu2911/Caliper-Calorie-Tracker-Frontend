import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

type AppPageProps = PropsWithChildren<{
  className?: string;
}>;

export function AppPage({ children, className = '' }: AppPageProps) {
  return (
    <View className={`w-full max-w-xl self-center ${className}`}>
      {children}
    </View>
  );
}
