import { Link } from 'expo-router';
import { SearchX } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { PageHead } from '@/src/components/layout/PageHead';
import { PublicShell } from '@/src/components/layout/PublicShell';
import { shadows } from '@/src/lib/shadows';

export default function NotFoundScreen() {
  return (
    <>
      <PageHead title="Page Not Found" />
      <PublicShell>
        <View className="min-w-0 flex-1 justify-center py-6">
          <View
            className="gap-7 rounded-3xl border border-white/10 bg-[#232220] p-6"
            style={shadows.card}>
            <View>
              <View className="mb-5 h-14 w-14 items-center justify-center rounded-2xl bg-accent">
                <SearchX color="#FFFFFF" size={25} strokeWidth={2.5} />
              </View>
              <Text className="text-3xl font-black tracking-tight text-white">
                Page not found
              </Text>
              <Text className="mt-2 text-sm leading-6 text-white/55">
                The page you requested does not exist or may have moved.
              </Text>
            </View>
            <Link
              accessibilityRole="link"
              className="min-h-12 rounded-xl bg-accent px-5 py-3.5 text-center text-sm font-black text-white"
              href="/">
              Return home
            </Link>
          </View>
        </View>
      </PublicShell>
    </>
  );
}
