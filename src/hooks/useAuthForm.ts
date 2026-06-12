import { useState } from 'react';

import { useAuth } from '@/src/hooks/useAuth';

export function useAuthForm() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(mode: 'sign-in' | 'sign-up') {
    setIsSubmitting(true);
    setError(null);
    try {
      if (mode === 'sign-in') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
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
    isValid: email.trim().length > 3 && password.length >= 6,
    setEmail,
    setPassword,
    submit,
  };
}
