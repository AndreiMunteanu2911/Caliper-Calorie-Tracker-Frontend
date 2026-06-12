import { Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { useAuthForm } from '@/src/hooks/useAuthForm';

export function AuthCard() {
  const form = useAuthForm();

  return (
    <View className="gap-4 rounded-3xl bg-panel p-6">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-white">Connect your account</Text>
        <Text className="text-muted">
          Sign in to load targets and server-calculated daily totals.
        </Text>
      </View>
      <TextInput
        accessibilityLabel="Email address"
        autoCapitalize="none"
        autoComplete="email"
        className="min-h-14 rounded-2xl bg-black/20 px-4 text-white"
        keyboardType="email-address"
        onChangeText={form.setEmail}
        placeholder="you@example.com"
        placeholderTextColor="#8da399"
        value={form.email}
      />
      <TextInput
        accessibilityLabel="Password"
        autoComplete="password"
        className="min-h-14 rounded-2xl bg-black/20 px-4 text-white"
        onChangeText={form.setPassword}
        placeholder="Password"
        placeholderTextColor="#8da399"
        secureTextEntry
        value={form.password}
      />
      {form.error ? <Text className="text-red-300">{form.error}</Text> : null}
      <PrimaryButton
        label="Sign in"
        loading={form.isSubmitting}
        disabled={!form.isValid}
        onPress={() => void form.submit('sign-in')}
      />
      <PrimaryButton
        label="Create account"
        disabled={form.isSubmitting || !form.isValid}
        onPress={() => void form.submit('sign-up')}
      />
    </View>
  );
}
