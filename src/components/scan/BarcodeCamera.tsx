import { CameraView } from 'expo-camera';
import { Camera, RefreshCcw, ScanLine } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/src/components/ui/Button';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
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
      <View className="h-72 items-center justify-center rounded-3xl border border-white/10 bg-[#242424]">
        <LoadingSpinner />
      </View>
    );
  }

  if (!scanner.permission.granted) {
    return (
      <View className="h-72 items-center justify-center gap-4 rounded-[28px] border border-white/10 bg-[#242424] p-6">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-accentSoft">
          <Camera color="#101010" size={25} strokeWidth={2.5} />
        </View>
        <Text className="text-center text-base text-white">
          Camera permission is required to scan food barcodes.
        </Text>
        <Button
          label="Allow camera"
          size="compact"
          onPress={() => void scanner.requestPermission()}
        />
      </View>
    );
  }

  return (
    <View className="h-72 overflow-hidden rounded-[30px] border-2 border-white bg-brand shadow-card">
      <CameraView
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
        className="flex-1"
        facing="back"
        onBarcodeScanned={scanner.enabled ? scanner.handleBarcodeScanned : undefined}
      />
      <View className="pointer-events-none absolute inset-0 items-center justify-center">
        <View className="h-32 w-[78%] items-center justify-center rounded-2xl border-2 border-accent">
          <ScanLine color="#FF5A2F" size={28} strokeWidth={2.2} />
        </View>
      </View>
      {!scanner.enabled ? (
        <View className="absolute inset-x-0 bottom-0 flex-row items-center justify-between bg-black/70 p-4">
          <Text className="text-white">
            {isLookingUp ? 'Looking up food...' : 'Barcode captured'}
          </Text>
          <Pressable
            accessibilityRole="button"
            className="flex-row items-center gap-2 rounded-full bg-white/10 px-3 py-2"
            onPress={() => {
              scanner.resume();
              onResume();
            }}>
            <RefreshCcw color="#FFFFFF" size={15} strokeWidth={2.5} />
            <Text className="font-black text-accent">Scan again</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
