import { CameraView } from 'expo-camera';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { useBarcodeScanner } from '@/src/hooks/useBarcodeScanner';

type BarcodeCameraProps = {
  isLookingUp: boolean;
  onDetected: (barcode: string) => void;
  onResume: () => void;
};

export function BarcodeCamera({
  isLookingUp,
  onDetected,
  onResume,
}: BarcodeCameraProps) {
  const scanner = useBarcodeScanner(onDetected);

  if (!scanner.permission) {
    return (
      <View className="h-72 items-center justify-center rounded-3xl bg-panel">
        <ActivityIndicator color="#b7f34a" />
      </View>
    );
  }

  if (!scanner.permission.granted) {
    return (
      <View className="h-72 items-center justify-center gap-4 rounded-3xl bg-panel p-6">
        <Text className="text-center text-base text-white">
          Camera permission is required to scan food barcodes.
        </Text>
        <Pressable
          accessibilityRole="button"
          className="rounded-2xl bg-lime px-5 py-3"
          onPress={() => void scanner.requestPermission()}>
          <Text className="font-bold text-canvas">Allow camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="h-72 overflow-hidden rounded-3xl border border-white/10">
      <CameraView
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
        className="flex-1"
        facing="back"
        onBarcodeScanned={scanner.enabled ? scanner.handleBarcodeScanned : undefined}
      />
      <View className="pointer-events-none absolute inset-0 items-center justify-center">
        <View className="h-32 w-[78%] rounded-2xl border-2 border-lime" />
      </View>
      {!scanner.enabled ? (
        <View className="absolute inset-x-0 bottom-0 flex-row items-center justify-between bg-black/70 p-4">
          <Text className="text-white">
            {isLookingUp ? 'Looking up food...' : 'Barcode captured'}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              scanner.resume();
              onResume();
            }}>
            <Text className="font-bold text-lime">Scan again</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
