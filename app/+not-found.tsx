import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { BrandMark } from '@/src/components/layout/BrandMark';
import { PublicShell } from '@/src/components/layout/PublicShell';

export default function NotFoundScreen() {
  return (
    <PublicShell>
      <View className="gap-8 rounded-[32px] border border-line bg-surface p-6 sm:p-8">
        <BrandMark />
        <View className="gap-2">
          <Text className="text-4xl font-black text-ink">Page not found</Text>
          <Text className="text-base leading-6 text-muted">
            The page you requested does not exist or has moved.
          </Text>
        </View>
        <Link
          accessibilityRole="link"
          className="min-h-14 rounded-2xl bg-brand px-5 py-4 text-center text-base font-black text-white"
          href="/">
          Return home
        </Link>
      </View>
    </PublicShell>
  );
}
