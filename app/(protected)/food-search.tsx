import { PageHead } from '@/src/components/layout/PageHead';
import { FoodSearchScreen } from '@/src/components/scan/FoodSearchScreen';

export default function FoodSearchRoute() {
  return (
    <>
      <PageHead title="Search Foods" />
      <FoodSearchScreen />
    </>
  );
}
