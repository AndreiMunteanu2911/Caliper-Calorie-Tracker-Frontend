import { useState } from 'react';
import { useRouter } from 'expo-router';

import { useAuth } from '@/src/hooks/useAuth';

export type AuthMode = 'sign-in' | 'sign-up';

export function useAuthForm(mode: AuthMode) {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    setIsSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === 'sign-in') {
        await signIn(email.trim(), password);
        router.replace('/dashboard');
      } else {
        const result = await signUp(email.trim(), password);
        if (result.requiresEmailConfirmation) {
          setMessage('Check your email to confirm your account, then sign in.');
        } else {
          router.replace('/dashboard');
        }
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    email,
    password,
    isSubmitting,
    error,
    message,
    isValid: email.trim().length > 3 && password.length >= 6,
    setEmail,
    setPassword,
    submit,
  };
}
