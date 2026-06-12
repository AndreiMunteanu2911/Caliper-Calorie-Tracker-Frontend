import { Redirect, useRouter } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';

import { BrandMark } from '@/src/components/layout/BrandMark';
import { PublicShell } from '@/src/components/layout/PublicShell';
import { AnimatedPresence } from '@/src/components/ui/AnimatedPresence';
import { Button } from '@/src/components/ui/Button';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { useAuth } from '@/src/hooks/useAuth';
import { type AuthMode, useAuthForm } from '@/src/hooks/useAuthForm';

type AuthScreenProps = {
  mode: AuthMode;
};

export function AuthScreen({ mode }: AuthScreenProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const form = useAuthForm(mode);
  const isSignIn = mode === 'sign-in';

  if (isLoading) {
    return (
      <PublicShell>
        <LoadingSpinner size="large" />
      </PublicShell>
    );
  }
  if (user) {
    return <Redirect href="/dashboard" />;
  }

  return (
    <PublicShell>
      <View className="gap-8 rounded-[32px] border border-line bg-surface p-6 shadow-sm sm:p-8">
        <View className="gap-8">
          <BrandMark />
          <View className="gap-2">
            <Text className="text-3xl font-black tracking-tight text-ink">
              {isSignIn ? 'Welcome back' : 'Create your account'}
            </Text>
            <Text className="text-base leading-6 text-muted">
              {isSignIn
                ? 'Sign in to continue tracking your nutrition.'
                : 'Set up your account and start building consistent nutrition habits.'}
            </Text>
          </View>
        </View>

        <View className="gap-4">
          <View className="gap-2">
            <Text className="text-sm font-bold text-ink">Email address</Text>
            <TextInput
              accessibilityLabel="Email address"
              autoCapitalize="none"
              autoComplete="email"
              className="h-14 rounded-2xl border border-line bg-canvas px-4 text-base text-ink"
              keyboardType="email-address"
              onChangeText={form.setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#77837D"
              value={form.email}
            />
          </View>
          <View className="gap-2">
            <Text className="text-sm font-bold text-ink">Password</Text>
            <TextInput
              accessibilityLabel="Password"
              autoComplete={isSignIn ? 'current-password' : 'new-password'}
              className="h-14 rounded-2xl border border-line bg-canvas px-4 text-base text-ink"
              onChangeText={form.setPassword}
              placeholder="At least 6 characters"
              placeholderTextColor="#77837D"
              secureTextEntry
              value={form.password}
            />
          </View>
          {form.error ? (
            <AnimatedPresence className="rounded-2xl bg-dangerSoft p-4">
              <Text className="text-sm font-semibold text-danger">{form.error}</Text>
            </AnimatedPresence>
          ) : null}
          {form.message ? (
            <AnimatedPresence className="rounded-2xl bg-successSoft p-4">
              <Text className="text-sm font-semibold text-brand">{form.message}</Text>
            </AnimatedPresence>
          ) : null}
          <Button
            label={isSignIn ? 'Sign in' : 'Create account'}
            disabled={!form.isValid}
            loading={form.isSubmitting}
            onPress={() => void form.submit()}
          />
        </View>

        <View className="flex-row flex-wrap items-center justify-center gap-1">
          <Text className="text-sm text-muted">
            {isSignIn ? 'New to Caliper?' : 'Already have an account?'}
          </Text>
          <Pressable
            accessibilityRole="link"
            onPress={() => router.replace(isSignIn ? '/sign-up' : '/sign-in')}>
            <Text className="text-sm font-black text-brand">
              {isSignIn ? 'Create account' : 'Sign in'}
            </Text>
          </Pressable>
        </View>
      </View>
    </PublicShell>
  );
}
