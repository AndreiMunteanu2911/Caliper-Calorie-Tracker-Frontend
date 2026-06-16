import { CameraView } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Barcode, RefreshCcw } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/src/components/ui/Button';
import { BackButton } from '@/src/components/ui/BackButton';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { useBarcodeLookup } from '@/src/hooks/useBarcodeLookup';
import { useBarcodeScanner } from '@/src/hooks/useBarcodeScanner';
import { shadows } from '@/src/lib/shadows';

function navigateToFoodDetail(
  router: ReturnType<typeof useRouter>,
  food: NonNullable<ReturnType<typeof useBarcodeLookup>['item']>,
  date?: string,
) {
  router.push({
    pathname: '/food-detail',
    params: {
      external_id: food.external_id,
      source: food.source,
      name: food.name,
      brand: food.brand ?? '',
      calories: String(food.calories),
      protein: String(food.protein),
      carbs: String(food.carbs),
      fats: String(food.fats),
      fiber: String(food.fiber),
      sugar: String(food.sugar),
      sodium_mg: String(food.sodium_mg),
      saturated_fat: String(food.saturated_fat),
      serving_size_g: String(food.serving_size_g),
      date,
    },
  });
}

export function BarcodeScannerScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date?: string }>();
  const insets = useSafeAreaInsets();
  const lookup = useBarcodeLookup();
  const scanner = useBarcodeScanner((value) => void lookup.lookup(value));

  function resume() {
    lookup.reset();
    scanner.resume();
  }

  if (!scanner.permission) {
    return (
      <View className="flex-1 items-center justify-center bg-brand">
        <LoadingSpinner />
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
      <View className="flex-1 items-center bg-brand">
        <View
          className="relative h-full w-full overflow-hidden bg-brand"
          style={[{ maxWidth: 448 }, shadows.card]}>
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
          <BackButton
            accessibilityLabel="Close barcode scanner"
            onPress={() => router.back()}
          />
          <Text className="ml-4 text-lg font-black text-white">Barcode scanner</Text>
        </View>

        <View className="pointer-events-none absolute inset-x-8 top-[28%] h-48 rounded-3xl border-4 border-white">
          <View className="absolute left-4 right-4 top-1/2 h-0.5 bg-accent" />
        </View>

        <View
          className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-[#121212] px-5 pt-6"
          style={{ paddingBottom: insets.bottom + 20 }}>
          {lookup.isLoading ? (
            <View className="items-center py-5">
              <LoadingSpinner />
              <Text className="mt-3 text-white/60">Looking up nutrition...</Text>
            </View>
          ) : lookup.item ? (
            <View className="gap-3">
              <Pressable
                accessibilityHint="Opens food detail"
                accessibilityRole="button"
                className="rounded-2xl border border-white/10 bg-[#242424] p-3.5 active:scale-[0.99] active:opacity-80"
                style={shadows.card}
                onPress={() => navigateToFoodDetail(router, lookup.item!, date)}>
                <Text className="text-base font-black text-white">{lookup.item.name}</Text>
                {lookup.item.brand ? (
                  <Text className="mt-0.5 text-xs text-white/55">{lookup.item.brand}</Text>
                ) : null}
                <Text className="mt-1.5 text-sm font-black text-accent">
                  {Math.round(lookup.item.calories)} kcal
                </Text>
              </Pressable>
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
      </View>
    </>
  );
}
