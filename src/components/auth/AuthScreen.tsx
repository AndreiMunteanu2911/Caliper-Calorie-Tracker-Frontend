import { Redirect, useRouter } from 'expo-router';
import { ArrowRightIcon } from 'phosphor-react-native';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppPage } from '@/src/components/layout/AppPage';
import { BackButton } from '@/src/components/ui/BackButton';
import { Button } from '@/src/components/ui/Button';
import { InputBox } from '@/src/components/ui/InputBox';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
import { useAuth } from '@/src/hooks/useAuth';
import { type AuthMode, useAuthForm } from '@/src/hooks/useAuthForm';
import { MotionFade } from '@/src/lib/motion';

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
        <LoadingSpinner size="large" />
      </View>
    );
  }
  if (user) return <Redirect href="/dashboard" />;

  return (
    <SafeAreaView className="flex-1 bg-brand">
      <ScrollbarContainer
        className="flex-1 bg-brand"
        contentContainerClassName="grow justify-center py-5">
        <AppPage className="py-2">
          {!isSignIn ? (
            <BackButton className="mb-4" onPress={() => router.back()} />
          ) : null}

          <Text className="text-2xl font-black tracking-tighter text-white">
            {isSignIn ? 'Welcome Back to Caliper' : 'Create Your Caliper Account'}
          </Text>
          <Text className="mt-1 text-sm text-white/65">
            Eat better. Get back on track.
          </Text>

          <View className="mt-6 gap-3.5">
            {!isSignIn ? (
              <View className="gap-1">
                <Text className="pl-2 text-sm font-medium text-white">Display name</Text>
                <InputBox
                  accessibilityLabel="Display name"
                  compact
                  onChangeText={form.setDisplayName}
                  placeholder="Enter your name"
                  placeholderTextColor="#8F8F8F"
                  value={form.displayName}
                />
              </View>
            ) : null}
            <View className="gap-1">
              <Text className="pl-2 text-sm font-medium text-white">Email</Text>
              <InputBox
                accessibilityLabel="Email address"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                compact
                onChangeText={form.setEmail}
                placeholder="Enter email"
                placeholderTextColor="#8F8F8F"
                value={form.email}
              />
            </View>
            <View className="gap-1">
              <Text className="pl-2 text-sm font-medium text-white">Password</Text>
              <InputBox
                accessibilityLabel="Password"
                autoComplete={isSignIn ? 'current-password' : 'new-password'}
                compact
                onChangeText={form.setPassword}
                placeholder="Enter password"
                placeholderTextColor="#8F8F8F"
                secureTextEntry
                value={form.password}
              />
            </View>

            {form.error ? (
              <MotionFade className="rounded-2xl bg-dangerSoft p-3.5">
                <Text className="font-semibold text-danger">{form.error}</Text>
              </MotionFade>
            ) : null}
            {form.message ? (
              <MotionFade className="rounded-xl border border-accent bg-brand p-3.5">
                <Text className="text-center font-black text-accent">
                  {form.message}
                </Text>
              </MotionFade>
            ) : null}
          </View>

          <View className="mt-7">
            <Button
              label={isSignIn ? 'Log In' : 'Sign Up'}
              icon={ArrowRightIcon}
              disabled={!form.isValid}
              loading={form.isSubmitting}
              onPress={() => void form.submit()}
            />
          </View>
          <View className="mt-4 flex-row items-center justify-center gap-1">
            <Text className="text-sm text-white/80">
              {isSignIn ? "Don't have an account?" : 'Already have an account?'}
            </Text>
            <Pressable
              accessibilityRole="link"
              onPress={() => router.replace(isSignIn ? '/sign-up' : '/sign-in')}>
              <Text className="text-sm font-bold text-accent">
                {isSignIn ? 'Sign Up' : 'Log In'}
              </Text>
            </Pressable>
          </View>
        </AppPage>
      </ScrollbarContainer>
    </SafeAreaView>
  );
}
