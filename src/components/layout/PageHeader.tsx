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
    <View className="flex-row items-end justify-between gap-4">
      <View className="min-w-0 flex-1">
        <Text className="text-4xl font-black leading-[42px] tracking-[-1.5px] text-white">
          {title}
        </Text>
        <Text className="mt-2 max-w-2xl text-base leading-6 text-white/55">
          {description}
        </Text>
      </View>
      {action ? <View className="pb-1">{action}</View> : null}
    </View>
  );
}
