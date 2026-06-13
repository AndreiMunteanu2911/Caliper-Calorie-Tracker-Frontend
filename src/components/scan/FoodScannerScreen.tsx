import { Barcode, Camera, ChevronRight, Plus, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  Text,
  View,
} from 'react-native';
import type { ScrollView } from 'react-native';

import { AppPage } from '@/src/components/layout/AppPage';
import { PageHeader } from '@/src/components/layout/PageHeader';
import { CustomFoodForm } from '@/src/components/food/CustomFoodForm';
import { Dropdown } from '@/src/components/ui/Dropdown';
import { DropdownItem } from '@/src/components/ui/DropdownItem';
import { InputBox } from '@/src/components/ui/InputBox';
import { MealAnalysisPanel } from '@/src/components/scan/MealAnalysisPanel';
import { AnimatedPresence } from '@/src/components/ui/AnimatedPresence';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
import { useFoodSearch } from '@/src/hooks/useFoodSearch';
import { useScanScreenState, type ScanMode } from '@/src/hooks/useScanScreenState';
import type { FoodItem } from '@/src/types/api';

const MODES = [
  { icon: Search, label: 'Search', value: 'search' },
  { icon: Camera, label: 'Meal photo', value: 'meal' },
] satisfies { icon: typeof Barcode; label: string; value: ScanMode }[];

function navigateToFoodDetail(router: ReturnType<typeof useRouter>, food: FoodItem) {
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
      serving_size_g: String(food.serving_size_g),
    },
  });
}

export function FoodScannerScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [showCustomFoodForm, setShowCustomFoodForm] = useState(false);
  const scrollOffset = useRef(0);
  const pendingScrollOffset = useRef<number | null>(null);
  const state = useScanScreenState();
  const search = useFoodSearch(state.query);

  function changeMode(mode: ScanMode) {
    const offset = scrollOffset.current;
    pendingScrollOffset.current = offset;
    state.setMode(mode);
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({ y: offset, animated: false });
    });
  }

  function restoreScrollPosition() {
    if (pendingScrollOffset.current === null) return;
    scrollViewRef.current?.scrollTo({
      y: pendingScrollOffset.current,
      animated: false,
    });
    pendingScrollOffset.current = null;
  }

  function trackScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    scrollOffset.current = event.nativeEvent.contentOffset.y;
  }

  return (
    <>
      <ScrollbarContainer
        ref={scrollViewRef}
        className="flex-1 bg-brand"
        contentContainerClassName="px-4 pb-32 pt-6 sm:px-6 sm:pt-10"
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={restoreScrollPosition}
        onScroll={trackScroll}
        scrollEventThrottle={16}>
        <AppPage>
          <View className="gap-8">
            <PageHeader
              title="What are you eating?"
              description="Choose the quickest way to add food to your diary."
            />

            <Pressable
              accessibilityRole="button"
              className="flex-row items-center rounded-[28px] bg-accent p-5"
              onPress={() => router.push('/barcode-camera')}>
              <View className="h-14 w-14 items-center justify-center rounded-full bg-white/20">
                <Barcode color="#FFFFFF" size={25} />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-xl font-black text-white">Scan a barcode</Text>
                <Text className="mt-1 text-sm text-white/75">
                  Point your camera at packaged food
                </Text>
              </View>
              <ChevronRight color="#FFFFFF" size={23} />
            </Pressable>

            <View className="overflow-hidden rounded-[32px] border border-white/10 bg-[#1C1C1C] p-3 shadow-card sm:p-4">
              <View className="relative overflow-hidden rounded-[26px] border border-white/30 bg-fats px-5 py-6 shadow-soft sm:px-7">
                <View className="absolute -right-10 -top-12 h-32 w-32 rounded-full border-[22px] border-white/20" />
                <Text className="text-xs font-black uppercase tracking-[1.5px] text-brand/55">
                  Add to your day
                </Text>
                <Text className="mt-2 text-3xl font-black tracking-[-1.5px] text-brand">
                  Search or photograph
                </Text>
                <Text className="mt-1 text-sm leading-5 text-brand/65">
                  Find an individual food or analyze a complete plate.
                </Text>
              </View>

              <View className="mt-3 gap-6 rounded-[26px] border border-white/10 bg-[#141414] p-4 shadow-card sm:p-7">
                <View className="flex-row rounded-[20px] border border-white/10 bg-[#242424] p-1.5 shadow-inner">
                  {MODES.map((item) => {
                    const ModeIcon = item.icon;
                    const selected = state.mode === item.value;
                    return (
                      <Pressable
                        accessibilityRole="tab"
                        accessibilityState={{ selected }}
                        className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-3 ${
                          selected ? 'bg-accent shadow-soft' : ''
                        }`}
                        key={item.value}
                        onPress={() => changeMode(item.value)}>
                        <ModeIcon
                          color={selected ? '#FFFFFF' : '#77756F'}
                          size={17}
                          strokeWidth={2.6}
                        />
                        <Text
                          className={
                            selected
                              ? 'font-black text-white'
                              : 'font-bold text-white/55'
                          }>
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View className="w-full max-w-3xl self-center">
                  {state.mode === 'search' ? (
                    <AnimatedPresence
                      animateLayout={false}
                      animateVisibility={false}>
                      <InputBox
                        autoCorrect={false}
                        onChangeText={state.setQuery}
                        placeholder="Search chicken breast, oats, rice..."
                        returnKeyType="search"
                        value={state.query}
                      />
                      {search.isLoading ? (
                        <View className="items-center pt-4">
                          <LoadingSpinner />
                        </View>
                      ) : null}
                      {search.error ? (
                        <AnimatedPresence className="mt-4 rounded-2xl bg-dangerSoft p-4">
                          <Text className="font-semibold text-danger">{search.error}</Text>
                        </AnimatedPresence>
                      ) : null}
                      {state.query.trim().length < 2 ? (
                        <View className="mt-4 items-center rounded-[26px] border border-white/10 bg-[#242424] p-8">
                          <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-fats">
                            <Search color="#101010" size={24} strokeWidth={2.5} />
                          </View>
                          <Text className="text-lg font-black text-white">
                            Search the food database
                          </Text>
                          <Text className="mt-2 text-center leading-5 text-white/55">
                            Enter at least two characters to find normalized nutrition
                            values.
                          </Text>
                        </View>
                      ) : null}
                      {search.items.length > 0 ? (
                        <View className="mt-4">
                          <Dropdown>
                            {search.items.map((food, index) => (
                              <DropdownItem
                                key={`${food.source}-${food.external_id}`}
                                label={food.name}
                                subtitle={food.brand || 'Nutrition per 100g'}
                                calories={food.calories}
                                protein={food.protein}
                                carbs={food.carbs}
                                fats={food.fats}
                                onPress={() => navigateToFoodDetail(router, food)}
                                isLast={index === search.items.length - 1}
                              />
                            ))}
                          </Dropdown>
                          <Pressable
                            className="mt-2 flex-row items-center justify-center gap-2 rounded-2xl border border-dashed border-accent/40 py-3"
                            onPress={() => setShowCustomFoodForm(true)}>
                            <Plus color="#FF5A16" size={16} strokeWidth={2.5} />
                            <Text className="font-bold text-accent">Custom food</Text>
                          </Pressable>
                        </View>
                      ) : null}
                    </AnimatedPresence>
                  ) : null}

                  {state.mode === 'meal' ? (
                    <AnimatedPresence
                      animateLayout={false}
                      animateVisibility={false}>
                      <MealAnalysisPanel />
                    </AnimatedPresence>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        </AppPage>
      </ScrollbarContainer>
      <CustomFoodForm
        onDismiss={() => setShowCustomFoodForm(false)}
        visible={showCustomFoodForm}
      />
    </>
  );
}
