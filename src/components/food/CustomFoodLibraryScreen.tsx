import { ChevronLeft, Pencil, Plus, Search, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CustomFoodForm } from '@/src/components/food/CustomFoodForm';
import { AppPage } from '@/src/components/layout/AppPage';
import { Button } from '@/src/components/ui/Button';
import { DeleteIconButton } from '@/src/components/ui/DeleteIconButton';
import { InputBox } from '@/src/components/ui/InputBox';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
import { useCustomFoods } from '@/src/hooks/useCustomFoods';
import type { FoodItem } from '@/src/types/api';

export function CustomFoodLibraryScreen() {
  const router = useRouter();
  const { items, isLoading, load, update, remove } = useCustomFoods();
  const [query, setQuery] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void load().catch((requestError) => {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load custom foods.',
      );
    });
  }, [load]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized
      ? items.filter((item) =>
          `${item.name} ${item.brand ?? ''}`.toLowerCase().includes(normalized),
        )
      : items;
  }, [items, query]);

  function openCreate() {
    setEditingFood(null);
    setEditorOpen(true);
  }

  function openEdit(food: FoodItem) {
    setEditingFood(food);
    setEditorOpen(true);
  }

  return (
    <>
      <ScrollbarContainer
        className="flex-1 bg-brand"
        contentContainerClassName="pb-8 pt-5">
        <AppPage>
          <View className="flex-row items-center gap-3">
            <Pressable
              accessibilityLabel="Go back"
              className="h-10 w-10 items-center justify-center rounded-xl bg-[#232220]"
              onPress={() => router.back()}>
              <ChevronLeft color="#FFFFFF" size={19} />
            </Pressable>
            <View className="min-w-0 flex-1">
              <Text className="text-xl font-black text-white">My foods</Text>
              <Text className="text-sm text-white/45">
                Favorites and recently used foods appear first.
              </Text>
            </View>
            <Button label="Create" size="compact" onPress={openCreate} />
          </View>

          <View className="mt-5">
            <InputBox
              value={query}
              onChangeText={setQuery}
              placeholder="Search your food library"
              accessibilityLabel="Search custom foods"
            />
          </View>

          {error ? (
            <Text className="mt-4 rounded-xl bg-dangerSoft p-3 font-semibold text-danger">
              {error}
            </Text>
          ) : null}

          {isLoading && items.length === 0 ? (
            <View className="items-center py-16">
              <LoadingSpinner />
            </View>
          ) : filtered.length === 0 ? (
            <View className="mt-5 items-center rounded-3xl border border-white/10 bg-[#232220] p-8">
              <Search color="#FF5A16" size={24} />
              <Text className="mt-3 font-black text-white">No custom foods found</Text>
            </View>
          ) : (
            <View className="mt-5 gap-2">
              {filtered.map((food) => (
                <View
                  className="flex-row items-center gap-3 rounded-2xl border border-white/10 bg-[#232220] p-3"
                  key={food.external_id}>
                  <Pressable
                    accessibilityLabel={
                      food.is_favorite ? 'Remove favorite' : 'Add favorite'
                    }
                    className="h-10 w-10 items-center justify-center rounded-xl bg-white/5"
                    onPress={() =>
                      void update(food.external_id, {
                        is_favorite: !food.is_favorite,
                      }).catch(() => setError('Unable to update favorite.'))
                    }>
                    <Star
                      color={food.is_favorite ? '#F5F378' : '#777777'}
                      fill={food.is_favorite ? '#F5F378' : 'transparent'}
                      size={18}
                    />
                  </Pressable>
                  <View className="min-w-0 flex-1">
                    <Text className="font-black text-white" numberOfLines={1}>
                      {food.name}
                    </Text>
                    <Text className="mt-0.5 text-xs text-white/45">
                      {Math.round(food.calories)} kcal · P {food.protein.toFixed(1)} ·
                      C {food.carbs.toFixed(1)} · F {food.fats.toFixed(1)}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityLabel={`Edit ${food.name}`}
                    className="h-9 w-9 items-center justify-center rounded-xl bg-white/5"
                    onPress={() => openEdit(food)}>
                    <Pencil color="#FFFFFF" size={15} />
                  </Pressable>
                  <DeleteIconButton
                    accessibilityLabel={`Delete ${food.name}`}
                    onPress={() =>
                      void remove(food.external_id).catch(() =>
                        setError('Unable to delete custom food.'),
                      )
                    }
                  />
                </View>
              ))}
            </View>
          )}
        </AppPage>
      </ScrollbarContainer>

      <CustomFoodForm
        initialFood={editingFood}
        visible={editorOpen}
        onDismiss={() => setEditorOpen(false)}
        onSaved={() => void load()}
      />
    </>
  );
}
