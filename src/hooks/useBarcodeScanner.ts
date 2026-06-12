import type { BarcodeScanningResult } from 'expo-camera';
import { useCameraPermissions } from 'expo-camera';
import { useCallback, useState } from 'react';

export function useBarcodeScanner(onDetected: (barcode: string) => void) {
  const [permission, requestPermission] = useCameraPermissions();
  const [enabled, setEnabled] = useState(true);

  const handleBarcodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      if (!enabled) return;
      setEnabled(false);
      onDetected(result.data);
    },
    [enabled, onDetected],
  );

  const resume = useCallback(() => setEnabled(true), []);

  return {
    permission,
    requestPermission,
    enabled,
    handleBarcodeScanned,
    resume,
  };
}
