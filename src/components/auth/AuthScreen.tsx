import { Redirect, useRouter } from 'expo-router';
import { ArrowRight, LockKeyhole, Mail, Sparkles } from 'lucide-react-native';
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
      <View className="flex-1 items-center justify-center bg-brand">
        <LoadingSpinner color="white" size="large" />
      </View>
    );
  }
  if (user) {
    return <Redirect href="/dashboard" />;
  }

  return (
    <PublicShell>
      <View className="w-full max-w-4xl self-center overflow-hidden rounded-[34px] bg-brand shadow-card md:flex-row">
        <View className="justify-between bg-protein p-7 md:w-[42%] md:p-10">
          <BrandMark />
          <View className="my-12">
            <View className="mb-5 h-12 w-12 items-center justify-center rounded-2xl bg-white/60">
              <Sparkles color="#101010" size={22} strokeWidth={2.6} />
            </View>
            <Text className="text-xs font-black uppercase tracking-[2px] text-brand/60">
              Your nutrition, simplified
            </Text>
            <Text className="mt-4 text-4xl font-black leading-[44px] tracking-[-2.3px] text-brand">
              Small logs.{'\n'}Clear progress.
            </Text>
            <Text className="mt-4 leading-6 text-brand/65">
              Build a useful picture of your nutrition without turning every meal
              into homework.
            </Text>
          </View>
          <View className="h-3 w-20 rounded-full bg-carbs" />
        </View>

        <View className="flex-1 gap-8 bg-surface p-7 sm:p-10">
          <View className="gap-2">
            <Text className="text-xs font-black uppercase tracking-[2px] text-accent">
              {isSignIn ? 'Good to see you' : 'Get started'}
            </Text>
            <Text className="mt-2 text-3xl font-black tracking-[-1.5px] text-ink">
              {isSignIn ? 'Welcome back' : 'Create your account'}
            </Text>
            <Text className="text-base leading-6 text-muted">
              {isSignIn
                ? 'Sign in to continue tracking your nutrition.'
                : 'Set up your account and start building consistent nutrition habits.'}
            </Text>
          </View>

          <View className="gap-4">
            <View className="gap-2">
              <Text className="text-sm font-bold text-ink">Email address</Text>
              <View className="h-14 flex-row items-center gap-3 rounded-2xl border border-line bg-raised px-4">
                <Mail color="#77756F" size={19} strokeWidth={2.4} />
                <TextInput
                  accessibilityLabel="Email address"
                  autoCapitalize="none"
                  autoComplete="email"
                  className="min-w-0 flex-1 text-base text-ink"
                  keyboardType="email-address"
                  onChangeText={form.setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="#787570"
                  value={form.email}
                />
              </View>
            </View>
            <View className="gap-2">
              <Text className="text-sm font-bold text-ink">Password</Text>
              <View className="h-14 flex-row items-center gap-3 rounded-2xl border border-line bg-raised px-4">
                <LockKeyhole color="#77756F" size={19} strokeWidth={2.4} />
                <TextInput
                  accessibilityLabel="Password"
                  autoComplete={isSignIn ? 'current-password' : 'new-password'}
                  className="min-w-0 flex-1 text-base text-ink"
                  onChangeText={form.setPassword}
                  placeholder="At least 6 characters"
                  placeholderTextColor="#787570"
                  secureTextEntry
                  value={form.password}
                />
              </View>
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
              icon={ArrowRight}
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
              <Text className="text-sm font-black text-accent">
                {isSignIn ? 'Create account' : 'Sign in'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </PublicShell>
  );
}
