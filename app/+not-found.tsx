import { Link } from 'expo-router';
import { SearchX } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { PageHead } from '@/src/components/layout/PageHead';
import { PublicShell } from '@/src/components/layout/PublicShell';

export default function NotFoundScreen() {
  return (
    <>
      <PageHead title="Page Not Found" />
      <PublicShell>
        <View className="gap-8 rounded-[32px] border border-line bg-surface p-6 sm:p-8">
        <View className="gap-2">
          <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-fatsSoft">
            <SearchX color="#101010" size={25} strokeWidth={2.5} />
          </View>
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
    </>
  );
}
