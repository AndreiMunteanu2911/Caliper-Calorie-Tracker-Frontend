import { PageHead } from '@/src/components/layout/PageHead';
import { MealAnalysisScreen } from '@/src/components/scan/MealAnalysisScreen';

export default function MealAnalysisRoute() {
  return (
    <>
      <PageHead title="Meal Photo" />
      <MealAnalysisScreen />
    </>
  );
}
