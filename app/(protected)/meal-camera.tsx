import { PageHead } from '@/src/components/layout/PageHead';
import { MealCameraScreen } from '@/src/components/scan/MealCameraScreen';

export default function MealCameraRoute() {
  return (
    <>
      <PageHead title="Meal Camera" />
      <MealCameraScreen />
    </>
  );
}
