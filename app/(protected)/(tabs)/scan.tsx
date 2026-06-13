import { PageHead } from '@/src/components/layout/PageHead';
import { FoodScannerScreen } from '@/src/components/scan/FoodScannerScreen';

export default function ScanRoute() {
  return (
    <>
      <PageHead title="Add Food" />
      <FoodScannerScreen />
    </>
  );
}
