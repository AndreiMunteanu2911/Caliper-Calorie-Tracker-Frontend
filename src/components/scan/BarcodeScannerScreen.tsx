import { CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Barcode, ChevronLeft, RefreshCcw } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FoodResultCard } from '@/src/components/food/FoodResultCard';
import { QuickLogModal } from '@/src/components/food/QuickLogModal';
import { Button } from '@/src/components/ui/Button';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { useBarcodeLookup } from '@/src/hooks/useBarcodeLookup';
import { useBarcodeScanner } from '@/src/hooks/useBarcodeScanner';
import { useMealLogs } from '@/src/hooks/useMealLogs';
import type { MealType } from '@/src/types/api';

export function BarcodeScannerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const lookup = useBarcodeLookup();
  const mealLogs = useMealLogs();
  const scanner = useBarcodeScanner((value) => void lookup.lookup(value));

  async function save(mealType: MealType, quantityG: number) {
    const created = await mealLogs.createLog(mealType, quantityG);
    if (created) router.replace('/diary');
  }

  function resume() {
    lookup.reset();
    scanner.resume();
  }

  if (!scanner.permission) {
    return (
      <View className="flex-1 items-center justify-center bg-brand">
        <LoadingSpinner color="white" />
      </View>
    );
  }

  if (!scanner.permission.granted) {
    return (
      <View className="flex-1 items-center justify-center gap-5 bg-brand px-8">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-carbs">
          <Barcode color="#121212" size={29} />
        </View>
        <Text className="text-center text-2xl font-black text-white">Camera access</Text>
        <Text className="text-center leading-6 text-white/60">
          Allow camera access to scan product barcodes.
        </Text>
        <Button label="Allow camera" onPress={() => void scanner.requestPermission()} />
        <Button label="Go back" variant="outline" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <>
      <View className="flex-1 bg-brand">
        <CameraView
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
          }}
          className="flex-1"
          facing="back"
          onBarcodeScanned={
            scanner.enabled ? scanner.handleBarcodeScanned : undefined
          }
        />
        <View className="pointer-events-none absolute inset-0 bg-black/25" />
        <View
          className="absolute inset-x-0 top-0 flex-row items-center px-5"
          style={{ paddingTop: insets.top + 12 }}>
          <Pressable
            accessibilityLabel="Close barcode scanner"
            className="h-12 w-12 items-center justify-center rounded-full bg-black/55"
            onPress={() => router.back()}>
            <ChevronLeft color="#FFFFFF" size={25} />
          </Pressable>
          <Text className="ml-4 text-xl font-black text-white">Barcode scanner</Text>
        </View>

        <View className="pointer-events-none absolute inset-x-8 top-[28%] h-48 rounded-[30px] border-[3px] border-white">
          <View className="absolute left-4 right-4 top-1/2 h-0.5 bg-accent" />
        </View>

        <View
          className="absolute inset-x-0 bottom-0 rounded-t-[32px] bg-[#121212] px-5 pt-6"
          style={{ paddingBottom: insets.bottom + 20 }}>
          {lookup.isLoading ? (
            <View className="items-center py-5">
              <LoadingSpinner color="white" />
              <Text className="mt-3 text-white/60">Looking up nutrition...</Text>
            </View>
          ) : lookup.item ? (
            <View className="gap-3">
              <FoodResultCard food={lookup.item} onPress={mealLogs.selectFood} />
              <Button
                label="Scan another"
                icon={RefreshCcw}
                variant="outline"
                onPress={resume}
              />
            </View>
          ) : (
            <View className="items-center py-3">
              <Barcode color="#F5F378" size={27} />
              <Text className="mt-3 text-lg font-black text-white">
                Center the barcode in the frame
              </Text>
              <Text className="mt-1 text-center text-sm text-white/55">
                Scanning happens automatically
              </Text>
              {lookup.error ? (
                <Text className="mt-4 text-center font-semibold text-danger">
                  {lookup.error}
                </Text>
              ) : null}
              {!scanner.enabled ? (
                <View className="mt-4">
                  <Button label="Try again" size="compact" onPress={resume} />
                </View>
              ) : null}
            </View>
          )}
        </View>
      </View>
      <QuickLogModal
        error={mealLogs.error}
        food={mealLogs.selectedFood}
        isSaving={mealLogs.isSaving}
        onDismiss={mealLogs.dismiss}
        onSave={save}
      />
    </>
  );
}
