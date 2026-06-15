import { Plus, Search } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CustomFoodForm } from '@/src/components/food/CustomFoodForm';
import { AppPage } from '@/src/components/layout/AppPage';
import { BackButton } from '@/src/components/ui/BackButton';
import { Dropdown } from '@/src/components/ui/Dropdown';
import { DropdownItem } from '@/src/components/ui/DropdownItem';
import { InputBox } from '@/src/components/ui/InputBox';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
import { useFoodSearch } from '@/src/hooks/useFoodSearch';
import type { FoodItem } from '@/src/types/api';
import { MotionStagger } from '@/src/lib/motion';

function openFood(
  router: ReturnType<typeof useRouter>,
  food: FoodItem,
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

export function FoodSearchScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date?: string }>();
  const [query, setQuery] = useState('');
  const [showCustomFoodForm, setShowCustomFoodForm] = useState(false);
  const search = useFoodSearch(query);
  const hasQuery = query.trim().length >= 2;
  const showEmptyState =
    hasQuery && !search.isLoading && search.items.length === 0 && !search.error;

  return (
    <>
      <ScrollbarContainer
        className="flex-1 bg-brand"
        contentContainerClassName="pb-8 pt-5"
        keyboardShouldPersistTaps="handled">
        <AppPage>
          <View className="flex-row items-center gap-3">
            <BackButton onPress={() => router.back()} />
            <View className="min-w-0 flex-1">
              <Text className="text-xl font-black text-white">Search foods</Text>
              <Text className="text-sm text-white/45">
                Find nutrition information and add it to your diary.
              </Text>
            </View>
          </View>

          <View className="mt-5">
            <InputBox
              autoFocus
              autoCorrect={false}
              onChangeText={setQuery}
              placeholder="Search chicken breast, oats, rice..."
              returnKeyType="search"
              value={query}
            />
          </View>

          {search.isLoading ? (
            <View className="mt-4 items-center rounded-3xl border border-white/10 bg-[#232220] py-6">
              <LoadingSpinner />
              <Text className="mt-2 text-sm font-semibold text-white/40">
                Searching database...
              </Text>
            </View>
          ) : null}

          {search.error ? (
            <Text className="mt-4 rounded-2xl bg-dangerSoft p-3.5 font-semibold text-danger">
              {search.error}
            </Text>
          ) : null}

          {!hasQuery ? (
            <View className="mt-4 items-center rounded-3xl border border-white/10 bg-[#232220] p-6">
              <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl bg-fats">
                <Search color="#101010" size={20} strokeWidth={2.5} />
              </View>
              <Text className="text-base font-black text-white">
                Search the food database
              </Text>
              <Text className="mt-1 text-center leading-5 text-white/55">
                Enter at least two characters to begin.
              </Text>
            </View>
          ) : null}

          {showEmptyState ? (
            <View className="mt-4 items-center rounded-3xl border border-white/10 bg-[#232220] p-6">
              <Search color="#FF5A16" size={22} strokeWidth={2.5} />
              <Text className="mt-3 text-base font-black text-white">
                No results found
              </Text>
              <Text className="mt-1 text-center leading-5 text-white/55">
                Try a different term or create a custom food.
              </Text>
            </View>
          ) : null}

          {search.items.length > 0 ? (
            <View className="mt-4">
              <Dropdown resultCount={search.items.length} query={query.trim()}>
                {search.items.map((food, index) => (
                  <MotionStagger
                    index={index}
                    key={`${food.source}-${food.external_id}`}>
                    <DropdownItem
                      label={food.name}
                      subtitle={food.brand || 'Nutrition per 100g'}
                      calories={food.calories}
                      protein={food.protein}
                      carbs={food.carbs}
                      fats={food.fats}
                      onPress={() => openFood(router, food, date)}
                      isLast={index === search.items.length - 1}
                    />
                  </MotionStagger>
                ))}
              </Dropdown>
            </View>
          ) : null}

          {hasQuery && !search.isLoading ? (
            <Pressable
              className="mt-3 min-h-11 flex-row items-center justify-center gap-2 rounded-xl border border-accent bg-brand px-3.5"
              onPress={() => setShowCustomFoodForm(true)}>
              <Plus color="#FF5A16" size={15} strokeWidth={2.5} />
              <Text className="text-sm font-black tracking-tight text-accent">
                Create custom food
              </Text>
            </Pressable>
          ) : null}
        </AppPage>
      </ScrollbarContainer>

      <CustomFoodForm
        date={date}
        onDismiss={() => setShowCustomFoodForm(false)}
        visible={showCustomFoodForm}
      />
    </>
  );
}
