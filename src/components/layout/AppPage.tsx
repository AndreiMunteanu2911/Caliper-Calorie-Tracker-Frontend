import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

export function AppPage({ children }: PropsWithChildren) {
  return <View className="w-full max-w-xl self-center">{children}</View>;
}
