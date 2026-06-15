import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { apiRequest } from '@/src/lib/api-client';
import type { MacroHistoryResponse } from '@/src/types/api';

export type Period = 'day' | 'week';
export type StatsTab = 'calories' | 'macros';

export function useNutritionStats() {
  const [data, setData] = useState<MacroHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('week');

  const days = period === 'week' ? 7 : 1;

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      const result = await apiRequest<MacroHistoryResponse>(
        `/macros/history?days=${days}&timezone=${encodeURIComponent(tz)}`,
      );
      setData(result);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load nutrition stats.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return { data, isLoading, error, period, setPeriod, refresh };
}
