import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { AppPage } from '@/src/components/layout/AppPage';
import { BackButton } from '@/src/components/ui/BackButton';
import { MealAnalysisPanel } from '@/src/components/scan/MealAnalysisPanel';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';

export function MealAnalysisScreen() {
  const router = useRouter();

  return (
    <ScrollbarContainer
      className="flex-1 bg-brand"
      contentContainerClassName="pb-8 pt-5">
      <AppPage>
        <View className="mb-5 flex-row items-center gap-3">
          <BackButton onPress={() => router.back()} />
          <View className="min-w-0 flex-1">
            <Text className="text-xl font-black text-white">Meal photo</Text>
            <Text className="text-sm text-white/45">
              Photograph a plate and review the estimated portions.
            </Text>
          </View>
        </View>

        <MealAnalysisPanel />
      </AppPage>
    </ScrollbarContainer>
  );
}
