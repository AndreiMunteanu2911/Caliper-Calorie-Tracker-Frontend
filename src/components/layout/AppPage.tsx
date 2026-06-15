import type { PropsWithChildren } from "react";
import { View } from "react-native";

type AppPageProps = PropsWithChildren<{
  className?: string;
}>;

export function AppPage({ children, className = "" }: AppPageProps) {
  return (
    <View className={`w-full max-w-sm self-center px-2.5 xs:px-3 sm:max-w-md ${className}`}>
      {children}
    </View>
  );
}
