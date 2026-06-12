import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <View className="flex-row items-end justify-between gap-4">
      <View className="flex-1">
        <Text className="text-[11px] font-black uppercase tracking-[2.2px] text-accent">
          {eyebrow}
        </Text>
        <Text className="mt-2 text-3xl font-black tracking-[-1.6px] text-white">
          {title}
        </Text>
        {description ? (
          <Text className="mt-1 text-sm leading-5 text-white/55">{description}</Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}
