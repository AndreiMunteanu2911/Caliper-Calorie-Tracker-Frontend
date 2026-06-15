import type { PropsWithChildren } from 'react';
import Animated from 'react-native-reanimated';

import { motion } from '@/src/lib/motion';
import {View} from "react-native";

type AppPageProps = PropsWithChildren<{
  className?: string;
}>;

export function AppPage({ children, className = '' }: AppPageProps) {
  return (
      <View className={`w-full max-w-sm self-center px-2.5 xs:px-3 sm:max-w-md ${className}`}>
        <Animated.View
            className={`px-2.5 xs:px-3 ${className}`}
            entering={motion.page}
            style={{ alignSelf: 'center', maxWidth: 448, width: '100%' }}>
          {children}
        </Animated.View>
      </View>

  );
}
