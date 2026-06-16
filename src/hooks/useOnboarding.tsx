import {
  createContext,
  type PropsWithChildren,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';

import { useAuth } from '@/src/hooks/useAuth';
import { apiRequest } from '@/src/lib/api-client';
import type { Profile } from '@/src/types/api';

type OnboardingContextValue = {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  resolve: (profile: Profile) => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: PropsWithChildren) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef(session);
  const profileRef = useRef(profile);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const refresh = useCallback(async () => {
    const currentSession = sessionRef.current;

    if (!currentSession) {
      profileRef.current = null;
      setProfile(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(Platform.OS === 'web' ? !profileRef.current : true);
    setError(null);
    try {
      const nextProfile = await apiRequest<Profile>('/profile');
      profileRef.current = nextProfile;
      setProfile(nextProfile);
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

  const resolve = useCallback((nextProfile: Profile) => {
    profileRef.current = nextProfile;
    setProfile(nextProfile);
  }, []);

  useEffect(() => {
    profileRef.current = null;
    setProfile(null);
    setIsLoading(true);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    void refresh();
  }, [refresh, userId]);

  const value = useMemo(
    () => ({
      profile,
      isLoading,
      error,
      refresh,
      resolve,
    }),
    [error, isLoading, profile, refresh, resolve],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used inside OnboardingProvider.');
  }
  return context;
}
