import { useRouter } from 'expo-router';
import { Plus, Sparkles, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/src/components/ui/Button';
import { InputBox } from '@/src/components/ui/InputBox';
import { useCustomFoods } from '@/src/hooks/useCustomFoods';

type CustomFoodFormProps = {
  visible: boolean;
  onDismiss: () => void;
};

export function CustomFoodForm({ visible, onDismiss }: CustomFoodFormProps) {
  const router = useRouter();
  const { create } = useCustomFoods();
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nutritionIsValid = [calories, protein, carbs, fats].every((value) => {
    if (!value.trim()) return true;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0;
  });

  async function save() {
    if (!name.trim() || !nutritionIsValid) return;
    setIsSaving(true);
    setError(null);
    try {
      const created = await create({
        name: name.trim(),
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fats: Number(fats) || 0,
      });
      setName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFats('');
      onDismiss();
      router.push({
        pathname: '/food-detail',
        params: {
          external_id: created.external_id,
          source: created.source,
          name: created.name,
          brand: created.brand ?? '',
          calories: String(created.calories),
          protein: String(created.protein),
          carbs: String(created.carbs),
          fats: String(created.fats),
          serving_size_g: String(created.serving_size_g),
        },
      });
    } catch {
      setError('Unable to save custom food.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
      transparent
      visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={StyleSheet.absoluteFillObject}>
        <View className="flex-1 items-center justify-center bg-black/80 px-4 py-8">
          <Pressable onPress={onDismiss} style={StyleSheet.absoluteFillObject} />
          <View
            className="w-full max-w-lg overflow-hidden border border-white/15 bg-[#1C1C1C] shadow-card"
            style={{ borderRadius: 30, maxHeight: '92%' }}>
            <ScrollView
              className="caliper-scrollbar"
              contentContainerClassName="p-3"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator>
              <View className="relative overflow-hidden rounded-[24px] bg-carbs p-5">
                <View className="absolute -right-8 -top-10 h-28 w-28 rounded-full border-[20px] border-white/25" />
                <View className="flex-row items-start justify-between">
                  <View className="min-w-0 flex-1 pr-4">
                    <Text className="text-xs font-black uppercase tracking-[1.4px] text-brand/50">
                      Your food library
                    </Text>
                    <Text className="mt-2 text-3xl font-black tracking-[-1.2px] text-brand">
                      Create custom food
                    </Text>
                    <Text className="mt-2 leading-5 text-brand/60">
                      Enter nutrition per 100g. You can choose the portion next.
                    </Text>
                  </View>
                  <Pressable
                    accessibilityLabel="Close custom food"
                    className="h-11 w-11 items-center justify-center rounded-full bg-white/60"
                    onPress={onDismiss}>
                    <X color="#101010" size={20} strokeWidth={2.7} />
                  </Pressable>
                </View>
              </View>

              <View className="gap-5 px-2 pb-3 pt-5">
                <View className="gap-2">
                  <View className="flex-row items-center gap-2">
                    <Sparkles color="#FF5A16" size={16} />
                    <Text className="font-black text-white">Food name</Text>
                  </View>
                  <InputBox
                    compact
                    onChangeText={setName}
                    placeholder="Chicken breast"
                    value={name}
                  />
                </View>

                <View className="gap-3">
                  <Text className="font-black text-white">Nutrition per 100g</Text>
                  <View className="flex-row gap-3">
                    <View className="min-w-0 flex-1 gap-1.5">
                      <Text className="text-xs font-bold text-white/40">Calories</Text>
                      <InputBox compact keyboardType="decimal-pad" onChangeText={setCalories} placeholder="kcal" value={calories} />
                    </View>
                    <View className="min-w-0 flex-1 gap-1.5">
                      <Text className="text-xs font-bold text-protein">Protein</Text>
                      <InputBox compact keyboardType="decimal-pad" onChangeText={setProtein} placeholder="grams" value={protein} />
                    </View>
                  </View>
                  <View className="flex-row gap-3">
                    <View className="min-w-0 flex-1 gap-1.5">
                      <Text className="text-xs font-bold text-carbs">Carbs</Text>
                      <InputBox compact keyboardType="decimal-pad" onChangeText={setCarbs} placeholder="grams" value={carbs} />
                    </View>
                    <View className="min-w-0 flex-1 gap-1.5">
                      <Text className="text-xs font-bold text-fats">Fat</Text>
                      <InputBox compact keyboardType="decimal-pad" onChangeText={setFats} placeholder="grams" value={fats} />
                    </View>
                  </View>
                </View>

                {error ? (
                  <View className="rounded-2xl bg-dangerSoft p-4">
                    <Text className="font-semibold text-danger">{error}</Text>
                  </View>
                ) : null}

                <Button
                  disabled={!name.trim() || !nutritionIsValid}
                  icon={Plus}
                  iconPosition="left"
                  label="Create and continue"
                  loading={isSaving}
                  onPress={() => void save()}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
