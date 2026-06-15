import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

type PageHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <View className="flex-row items-end justify-between gap-3">
      <View className="min-w-0 flex-1">
        <Text className="text-xl font-black leading-6 tracking-tight text-white sm:text-2xl">
          {title}
        </Text>
        <Text className="mt-0.5 max-w-2xl text-sm leading-5 text-white/55">
          {description}
        </Text>
      </View>
      {action ? <View className="pb-0.5">{action}</View> : null}
    </View>
  );
}
