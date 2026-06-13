import { PageHead } from '@/src/components/layout/PageHead';
import { BarcodeScannerScreen } from '@/src/components/scan/BarcodeScannerScreen';

export default function BarcodeCameraRoute() {
  return (
    <>
      <PageHead title="Barcode Scanner" />
      <BarcodeScannerScreen />
    </>
  );
}
