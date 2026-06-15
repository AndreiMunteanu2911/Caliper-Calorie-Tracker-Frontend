import { PageHead } from '@/src/components/layout/PageHead';
import { AddFoodScreen } from '@/src/components/scan/AddFoodScreen';

export default function AddFoodRoute() {
  return (
    <>
      <PageHead title="Add Food" />
      <AddFoodScreen />
    </>
  );
}
