import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { apiRequest } from '@/src/lib/api-client';
import type {
  WeightHistoryResponse,
  WeightLogCreate,
} from '@/src/types/api';

export function useWeightLogs() {
  const [data, setData] = useState<WeightHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await apiRequest<WeightHistoryResponse>('/weight-logs?limit=90'));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load weight history.',
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

  async function save(payload: WeightLogCreate): Promise<boolean> {
    setIsSaving(true);
    setError(null);
    try {
      await apiRequest('/weight-logs', { method: 'POST', body: payload });
      await refresh();
      return true;
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to save this weight.',
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function remove(id: string): Promise<void> {
    setError(null);
    try {
      await apiRequest<void>(`/weight-logs/${id}`, { method: 'DELETE' });
      await refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to delete this weight.',
      );
    }
  }

  return { data, isLoading, isSaving, error, refresh, save, remove };
}
