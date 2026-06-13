import { useRouter } from 'expo-router';
import { CirclePlus, Utensils } from 'lucide-react-native';
import { Pressable, RefreshControl, Text, View } from 'react-native';

import { MealLogCard } from '@/src/components/dashboard/MealLogCard';
import { AppPage } from '@/src/components/layout/AppPage';
import { PageHeader } from '@/src/components/layout/PageHeader';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
import { useDashboardData } from '@/src/hooks/useDashboardData';
import { MEAL_TYPES, type MealType } from '@/src/types/api';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
};

export function DiaryScreen() {
  const router = useRouter();
  const { data, isLoading, mutatingId, error, refresh, updateLog, deleteLog } =
    useDashboardData();

  return (
    <ScrollbarContainer
      className="flex-1 bg-brand"
      contentContainerClassName="px-5 pb-32 pt-7"
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refresh}
          tintColor="#FF5A16"
        />
      }>
      <AppPage>
        <PageHeader
          title="Food diary"
          description={`${data?.logs.length ?? 0} ${
            (data?.logs.length ?? 0) === 1 ? 'item' : 'items'
          } logged today.`}
          action={
            <Pressable
              accessibilityLabel="Add food"
              className="h-12 w-12 items-center justify-center rounded-full bg-accent"
              onPress={() => router.push('/scan')}>
              <CirclePlus color="#FFFFFF" size={23} />
            </Pressable>
          }
        />

        {error ? (
          <Text className="mt-6 rounded-2xl bg-dangerSoft p-4 font-semibold text-danger">
            {error}
          </Text>
        ) : null}

        {!data ? (
          <View className="items-center py-24">
            <LoadingSpinner />
          </View>
        ) : data.logs.length === 0 ? (
          <Pressable
            className="mt-10 items-center rounded-[28px] border border-white/10 bg-[#232220] p-10"
            onPress={() => router.push('/scan')}>
            <View className="h-16 w-16 items-center justify-center rounded-full bg-carbs">
              <Utensils color="#121212" size={27} />
            </View>
            <Text className="mt-5 text-xl font-black text-white">Nothing logged yet</Text>
            <Text className="mt-2 text-center leading-6 text-white/55">
              Add your first food by barcode, search, or meal photo.
            </Text>
          </Pressable>
        ) : (
          <View className="mt-9 gap-7">
            {MEAL_TYPES.map((mealType) => {
              const logs = data.logs.filter((log) => log.meal_type === mealType);
              if (logs.length === 0) return null;
              return (
                <View className="gap-3" key={mealType}>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xl font-black text-white">
                      {MEAL_LABELS[mealType]}
                    </Text>
                    <Text className="text-sm text-white/45">
                      {Math.round(logs.reduce((sum, log) => sum + log.calories, 0))} kcal
                    </Text>
                  </View>
                  {logs.map((log) => (
                    <MealLogCard
                      isMutating={mutatingId === log.id}
                      key={log.id}
                      log={log}
                      onDelete={deleteLog}
                      onUpdate={updateLog}
                    />
                  ))}
                </View>
              );
            })}
          </View>
        )}
      </AppPage>
    </ScrollbarContainer>
  );
}
