import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { FoodResultCard } from '@/src/components/food/FoodResultCard';
import { QuickLogModal } from '@/src/components/food/QuickLogModal';
import { AppPage } from '@/src/components/layout/AppPage';
import { BrandMark } from '@/src/components/layout/BrandMark';
import { BarcodeCamera } from '@/src/components/scan/BarcodeCamera';
import { MealAnalysisPanel } from '@/src/components/scan/MealAnalysisPanel';
import { AnimatedPresence } from '@/src/components/ui/AnimatedPresence';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { useBarcodeLookup } from '@/src/hooks/useBarcodeLookup';
import { useFoodSearch } from '@/src/hooks/useFoodSearch';
import { useMealLogs } from '@/src/hooks/useMealLogs';
import { useScanScreenState, type ScanMode } from '@/src/hooks/useScanScreenState';
import type { MealType } from '@/src/types/api';

const MODES: { label: string; value: ScanMode }[] = [
  { label: 'Barcode', value: 'barcode' },
  { label: 'Search', value: 'search' },
  { label: 'Meal photo', value: 'meal' },
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
        contentContainerClassName="px-4 pb-12 pt-6 sm:px-6 sm:pt-10"
        keyboardShouldPersistTaps="handled">
        <AppPage>
          <View className="gap-6">
            <BrandMark />
            <View>
              <Text className="text-sm font-black uppercase tracking-[2px] text-brand">
                Add food
              </Text>
              <Text className="mt-1 text-4xl font-black tracking-tight text-ink sm:text-5xl">
                Find it your way.
              </Text>
              <Text className="mt-2 max-w-xl text-base leading-6 text-muted">
                Scan a package, search verified foods, or analyze a complete meal
                from a photo.
              </Text>
            </View>

            <View className="flex-row rounded-2xl border border-line bg-surface p-1">
              {MODES.map((item) => (
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: state.mode === item.value }}
                  className={`flex-1 items-center rounded-xl py-3 ${
                    state.mode === item.value ? 'bg-brand' : ''
                  }`}
                  key={item.value}
                  onPress={() => state.setMode(item.value)}>
                  <Text
                    className={
                      state.mode === item.value
                        ? 'font-black text-white'
                        : 'font-bold text-muted'
                    }>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View className="w-full max-w-3xl self-center">
              {state.mode === 'barcode' && state.isFocused ? (
                <AnimatedPresence className="gap-4">
                  <BarcodeCamera
                    isLookingUp={barcode.isLoading}
                    onDetected={(value) => void barcode.lookup(value)}
                    onResume={barcode.reset}
                  />
                  {barcode.error ? (
                    <AnimatedPresence className="rounded-2xl bg-dangerSoft p-4">
                      <Text className="font-semibold text-danger">{barcode.error}</Text>
                    </AnimatedPresence>
                  ) : null}
                  {barcode.item ? (
                    <AnimatedPresence>
                      <FoodResultCard food={barcode.item} onPress={mealLogs.selectFood} />
                    </AnimatedPresence>
                  ) : (
                    <Text className="text-center text-sm text-muted">
                      Center the product barcode inside the frame.
                    </Text>
                  )}
                </AnimatedPresence>
              ) : null}

              {state.mode === 'search' ? (
                <AnimatedPresence className="gap-3">
                  <TextInput
                    accessibilityLabel="Search foods"
                    autoCorrect={false}
                    className="h-14 rounded-2xl border border-line bg-surface px-4 text-base text-ink"
                    onChangeText={state.setQuery}
                    placeholder="Search chicken breast, oats, rice..."
                    placeholderTextColor="#77837D"
                    returnKeyType="search"
                    value={state.query}
                  />
                  {search.isLoading ? <LoadingSpinner /> : null}
                  {search.error ? (
                    <AnimatedPresence className="rounded-2xl bg-dangerSoft p-4">
                      <Text className="font-semibold text-danger">{search.error}</Text>
                    </AnimatedPresence>
                  ) : null}
                  {state.query.trim().length < 2 ? (
                    <View className="items-center rounded-[28px] border border-dashed border-brand/25 bg-surface p-8">
                      <Text className="text-lg font-black text-ink">
                        Search the food database
                      </Text>
                      <Text className="mt-2 text-center leading-5 text-muted">
                        Enter at least two characters to find normalized nutrition
                        values.
                      </Text>
                    </View>
                  ) : null}
                  {search.items.map((food) => (
                    <FoodResultCard
                      food={food}
                      key={`${food.source}-${food.external_id}`}
                      onPress={mealLogs.selectFood}
                    />
                  ))}
                </AnimatedPresence>
              ) : null}

              {state.mode === 'meal' ? (
                <AnimatedPresence>
                  <MealAnalysisPanel />
                </AnimatedPresence>
              ) : null}
            </View>
          </View>
        </AppPage>
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
