import { Redirect, useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedPresence } from '@/src/components/ui/AnimatedPresence';
import { Button } from '@/src/components/ui/Button';
import { InputBox } from '@/src/components/ui/InputBox';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
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
  if (user) return <Redirect href="/dashboard" />;

  return (
    <SafeAreaView className="flex-1 bg-brand">
      <ScrollbarContainer
        className="bg-brand"
        contentContainerClassName="grow justify-center px-5 py-6">
        <View className="w-full max-w-md self-center py-4">
          {!isSignIn ? (
            <Pressable
              accessibilityLabel="Back"
              className="mb-5 h-11 w-11 items-center justify-center rounded-full bg-[#242424]"
              onPress={() => router.back()}>
              <ArrowLeft color="#FFFFFF" size={20} />
            </Pressable>
          ) : null}

          <Text className="text-3xl font-black tracking-[-1.4px] text-white">
            {isSignIn ? 'Welcome Back to Caliper' : 'Create Your Caliper Account'}
          </Text>
          <Text className="mt-2 text-base text-white/65">
            Eat better. Get back on track.
          </Text>

          <View className="mt-8 gap-4">
            {!isSignIn ? (
              <View className="gap-1.5">
                <Text className="pl-2 text-base font-medium text-white">Display name</Text>
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
            <View className="gap-1.5">
              <Text className="pl-2 text-base font-medium text-white">Email</Text>
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
            <View className="gap-1.5">
              <Text className="pl-2 text-base font-medium text-white">Password</Text>
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
              <AnimatedPresence className="rounded-2xl bg-dangerSoft p-4">
                <Text className="font-semibold text-danger">{form.error}</Text>
              </AnimatedPresence>
            ) : null}
            {form.message ? (
              <AnimatedPresence className="rounded-2xl bg-successSoft p-4">
                <Text className="font-semibold text-brand">{form.message}</Text>
              </AnimatedPresence>
            ) : null}
          </View>

          <View className="mt-9">
            <Button
              label={isSignIn ? 'Log In' : 'Sign Up'}
              icon={ArrowRight}
              disabled={!form.isValid}
              loading={form.isSubmitting}
              onPress={() => void form.submit()}
            />
          </View>
          <View className="mt-5 flex-row items-center justify-center gap-1">
            <Text className="text-base text-white/80">
              {isSignIn ? "Don't have an account?" : 'Already have an account?'}
            </Text>
            <Pressable
              accessibilityRole="link"
              onPress={() => router.replace(isSignIn ? '/sign-up' : '/sign-in')}>
              <Text className="text-base font-bold text-accent">
                {isSignIn ? 'Sign Up' : 'Log In'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollbarContainer>
    </SafeAreaView>
  );
}
