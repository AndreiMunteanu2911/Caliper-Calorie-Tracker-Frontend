import { PageHead } from '@/src/components/layout/PageHead';
import { NutritionStatsScreen } from '@/src/components/nutrition/NutritionStatsScreen';

export default function NutritionRoute() {
  return (
    <>
      <PageHead title="Nutrition Stats" />
      <NutritionStatsScreen />
    </>
  );
}
