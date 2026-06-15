import {
  Barcode,
  Camera,
  ChevronRight,
  Library,
  Plus,
  Search,
} from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CustomFoodForm } from '@/src/components/food/CustomFoodForm';
import { AppPage } from '@/src/components/layout/AppPage';
import { PageHeader } from '@/src/components/layout/PageHeader';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';

const ACTIONS = [
  {
    icon: Search,
    title: 'Search foods',
    description: 'Find foods and nutrition information',
    iconClassName: 'bg-fats',
    iconColor: '#101010',
    route: '/food-search',
  },
  {
    icon: Barcode,
    title: 'Scan a barcode',
    description: 'Point your camera at packaged food',
    iconClassName: 'bg-accent',
    iconColor: '#FFFFFF',
    route: '/barcode-camera',
  },
  {
    icon: Camera,
    title: 'Take a meal photo',
    description: 'Analyze a complete plate with AI',
    iconClassName: 'bg-carbs',
    iconColor: '#101010',
    route: '/meal-analysis',
  },
] as const;

export function AddFoodScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date?: string }>();
  const [showCustomFoodForm, setShowCustomFoodForm] = useState(false);

  return (
    <>
      <ScrollbarContainer
        className="flex-1 bg-brand"
        contentContainerClassName="px-4 pb-20 pt-5 sm:px-6 sm:pt-8">
        <AppPage>
          <View className="gap-4">
            <PageHeader
              title="What are you eating?"
              description="Choose the quickest way to add food to your diary."
            />

            {ACTIONS.map((action) => {
              const ActionIcon = action.icon;
              return (
                <Pressable
                  accessibilityRole="button"
                  className="flex-row items-center gap-3 rounded-3xl border border-white/10 bg-[#232220] p-4"
                  key={action.route}
                  onPress={() =>
                    router.push({
                      pathname: action.route,
                      params: date ? { date } : undefined,
                    })
                  }>
                  <View
                    className={`h-12 w-12 items-center justify-center rounded-full ${action.iconClassName}`}>
                    <ActionIcon color={action.iconColor} size={22} strokeWidth={2.5} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="text-lg font-black text-white">{action.title}</Text>
                    <Text className="mt-0.5 text-sm text-white/50">
                      {action.description}
                    </Text>
                  </View>
                  <ChevronRight color="#FFFFFF" size={20} />
                </Pressable>
              );
            })}

            <Pressable
              accessibilityRole="button"
              className="flex-row items-center gap-3 rounded-3xl border border-white/10 bg-[#232220] p-4"
              onPress={() => setShowCustomFoodForm(true)}>
              <View className="h-12 w-12 items-center justify-center rounded-full bg-accent">
                <Plus color="#FFFFFF" size={22} strokeWidth={2.5} />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-lg font-black text-white">Add a custom food</Text>
                <Text className="mt-0.5 text-sm text-white/50">
                  Create your own nutrition entry
                </Text>
              </View>
              <ChevronRight color="#FFFFFF" size={20} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              className="flex-row items-center gap-3 rounded-3xl border border-white/10 bg-[#232220] p-4"
              onPress={() =>
                router.push({
                  pathname: '/custom-foods',
                  params: date ? { date } : undefined,
                })
              }>
              <View className="h-12 w-12 items-center justify-center rounded-full bg-protein">
                <Library color="#101010" size={22} strokeWidth={2.5} />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-lg font-black text-white">My food library</Text>
                <Text className="mt-0.5 text-sm text-white/50">
                  Edit, favorite, search, or delete custom foods
                </Text>
              </View>
              <ChevronRight color="#FFFFFF" size={20} />
            </Pressable>
          </View>
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
