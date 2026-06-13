import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { apiRequest } from '@/src/lib/api-client';
import type { Profile, ProfileUpdate } from '@/src/types/api';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setProfile(await apiRequest<Profile>('/profile'));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load your profile.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  async function save(update: ProfileUpdate): Promise<boolean> {
    setIsSaving(true);
    setError(null);
    try {
      setProfile(
        await apiRequest<Profile>('/profile', {
          method: 'PATCH',
          body: update,
        }),
      );
      return true;
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to save your profile.',
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  return { profile, isLoading, isSaving, error, refresh, save };
}
