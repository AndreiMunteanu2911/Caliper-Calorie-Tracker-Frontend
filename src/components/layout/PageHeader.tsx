import { Sparkles } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { BrandMark } from '@/src/components/layout/BrandMark';

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <View className="gap-9">
      <View className="flex-row items-center justify-between">
        <BrandMark inverted />
        {action}
      </View>
      <View className="max-w-3xl">
        <View className="mb-4 flex-row items-center gap-2">
          <View className="h-8 w-8 items-center justify-center rounded-full bg-accent">
            <Sparkles color="#FFFFFF" size={15} strokeWidth={2.8} />
          </View>
          <Text className="text-xs font-black uppercase tracking-[2.4px] text-white/60">
            {eyebrow}
          </Text>
        </View>
        <Text className="text-4xl font-black leading-[42px] tracking-[-2.3px] text-white">
          {title}
        </Text>
        <Text className="mt-3 max-w-2xl text-base leading-6 text-white/60">
          {description}
        </Text>
      </View>
    </View>
  );
}
