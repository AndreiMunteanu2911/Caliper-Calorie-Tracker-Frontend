import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAuth } from '@/src/hooks/useAuth';
import { apiRequest } from '@/src/lib/api-client';
import type {
  DashboardData,
  MealLogItem,
  MealLogUpdate,
} from '@/src/types/api';

function timezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

function wait(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

export function useDashboardData() {
  const { session } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!session) {
      setData(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const path = `/dashboard?timezone=${encodeURIComponent(timezone())}`;
      let dashboard: DashboardData;
      try {
        dashboard = await apiRequest<DashboardData>(path);
      } catch {
        await wait(650);
        dashboard = await apiRequest<DashboardData>(path);
      }
      setData(dashboard);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load the dashboard.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const updateLog = useCallback(
    async (log: MealLogItem, update: MealLogUpdate): Promise<boolean> => {
      if (!data) return false;
      const previous = data;
      const quantity = update.quantity_g ?? log.quantity_g;
      const ratio = quantity / log.quantity_g;
      setMutatingId(log.id);
      setError(null);
      setData({
        ...data,
        logs: data.logs.map((item) =>
          item.id === log.id
            ? {
                ...item,
                ...update,
                calories: item.calories * ratio,
                protein: item.protein * ratio,
                carbs: item.carbs * ratio,
                fats: item.fats * ratio,
              }
            : item,
        ),
      });
      try {
        await apiRequest<MealLogItem>(`/meal-logs/${log.id}`, {
          method: 'PATCH',
          body: update,
        });
        await refresh();
        return true;
      } catch (requestError) {
        setData(previous);
        setError(
          requestError instanceof Error ? requestError.message : 'Unable to edit food.',
        );
        return false;
      } finally {
        setMutatingId(null);
      }
    },
    [data, refresh],
  );

  const performDelete = useCallback(
    async (log: MealLogItem) => {
      if (!data) return;
      const previous = data;
      setMutatingId(log.id);
      setError(null);
      setData({ ...data, logs: data.logs.filter((item) => item.id !== log.id) });
      try {
        await apiRequest<void>(`/meal-logs/${log.id}`, { method: 'DELETE' });
        await refresh();
      } catch (requestError) {
        setData(previous);
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to delete food.',
        );
      } finally {
        setMutatingId(null);
      }
    },
    [data, refresh],
  );

  const deleteLog = useCallback(
    async (log: MealLogItem) => {
      void performDelete(log);
    },
    [performDelete],
  );

  return {
    data,
    isLoading,
    mutatingId,
    error,
    refresh,
    updateLog,
    deleteLog,
  };
}
