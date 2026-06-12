import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { FoodResultCard } from '@/src/components/food/FoodResultCard';
import { QuickLogModal } from '@/src/components/food/QuickLogModal';
import { BarcodeCamera } from '@/src/components/scan/BarcodeCamera';
import { PlateAnalysisPanel } from '@/src/components/scan/PlateAnalysisPanel';
import { useBarcodeLookup } from '@/src/hooks/useBarcodeLookup';
import { useFoodSearch } from '@/src/hooks/useFoodSearch';
import { useMealLogs } from '@/src/hooks/useMealLogs';
import { useScanScreenState, type ScanMode } from '@/src/hooks/useScanScreenState';
import type { MealType } from '@/src/types/api';

const MODES: { label: string; value: ScanMode }[] = [
  { label: 'Barcode', value: 'barcode' },
  { label: 'Search', value: 'search' },
  { label: 'Plate AI', value: 'plate' },
];

export function FoodScannerScreen() {
  const state = useScanScreenState();
  const search = useFoodSearch(state.query);
  const barcode = useBarcodeLookup();
  const mealLogs = useMealLogs();

  async function save(mealType: MealType, quantityG: number) {
    const created = await mealLogs.createLog(mealType, quantityG);
    if (created) barcode.reset();
  }

  return (
    <>
      <ScrollView
        className="flex-1 bg-canvas"
        contentContainerClassName="gap-5 px-5 pb-12 pt-16"
        keyboardShouldPersistTaps="handled">
        <View>
          <Text className="text-sm font-semibold uppercase tracking-widest text-lime">
            Add food
          </Text>
          <Text className="text-4xl font-bold text-white">Find your meal</Text>
          <Text className="mt-2 text-base text-muted">
            Scan a package, search USDA foods, or estimate a plate from a photo.
          </Text>
        </View>

        <View className="flex-row rounded-2xl bg-panel p-1">
          {MODES.map((item) => (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: state.mode === item.value }}
              className={`flex-1 items-center rounded-xl py-3 ${
                state.mode === item.value ? 'bg-lime' : ''
              }`}
              key={item.value}
              onPress={() => state.setMode(item.value)}>
              <Text
                className={
                  state.mode === item.value
                    ? 'font-bold text-canvas'
                    : 'font-semibold text-muted'
                }>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {state.mode === 'barcode' && state.isFocused ? (
          <View className="gap-4">
            <BarcodeCamera
              isLookingUp={barcode.isLoading}
              onDetected={(value) => void barcode.lookup(value)}
              onResume={barcode.reset}
            />
            {barcode.error ? <Text className="text-red-300">{barcode.error}</Text> : null}
            {barcode.item ? (
              <FoodResultCard food={barcode.item} onPress={mealLogs.selectFood} />
            ) : null}
          </View>
        ) : null}

        {state.mode === 'search' ? (
          <View className="gap-3">
            <TextInput
              accessibilityLabel="Search foods"
              autoCorrect={false}
              className="h-14 rounded-2xl bg-panel px-4 text-base text-white"
              onChangeText={state.setQuery}
              placeholder="Search chicken breast, oats, rice..."
              placeholderTextColor="#8da399"
              returnKeyType="search"
              value={state.query}
            />
            {search.isLoading ? <ActivityIndicator color="#b7f34a" /> : null}
            {search.error ? <Text className="text-red-300">{search.error}</Text> : null}
            {search.items.map((food) => (
              <FoodResultCard
                food={food}
                key={`${food.source}-${food.external_id}`}
                onPress={mealLogs.selectFood}
              />
            ))}
          </View>
        ) : null}

        {state.mode === 'plate' ? <PlateAnalysisPanel /> : null}
      </ScrollView>
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
