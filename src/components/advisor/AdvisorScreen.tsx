import { FlatList, KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';

import { AppPage } from '@/src/components/layout/AppPage';
import { BrandMark } from '@/src/components/layout/BrandMark';
import { Button } from '@/src/components/ui/Button';
import { AnimatedPresence } from '@/src/components/ui/AnimatedPresence';
import { useAdvisorChat } from '@/src/hooks/useAdvisorChat';

export function AdvisorScreen() {
  const { messages, draft, isSending, error, setDraft, sendMessage } =
    useAdvisorChat();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-canvas"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="flex-1 px-4 pt-6 sm:px-6 sm:pt-10">
        <AppPage>
          <View className="mb-5 gap-5">
            <BrandMark />
            <View>
              <Text className="text-sm font-black uppercase tracking-[2px] text-brand">
                Live macro context
              </Text>
              <Text className="mt-1 text-4xl font-black tracking-tight text-ink sm:text-5xl">
                Your diet advisor.
              </Text>
              <Text className="mt-2 max-w-xl leading-6 text-muted">
                Ask for meal ideas and adjustments based on what you have left today.
              </Text>
            </View>
          </View>

          <View className="flex-1 overflow-hidden rounded-t-[32px] border border-line bg-surface">
            <FlatList
              className="flex-1 px-4"
              contentContainerClassName="gap-3 py-5"
              data={messages}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <View className="items-center px-4 py-12">
                  <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-accentSoft">
                    <Text className="text-2xl font-black text-brand">C</Text>
                  </View>
                  <Text className="text-xl font-black text-ink">How can I help?</Text>
                  <Text className="mt-2 max-w-sm text-center leading-6 text-muted">
                    Ask for a high-protein dinner, pre-workout meal, or a way to
                    balance today&apos;s remaining macros.
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <View
                  className={`max-w-[88%] rounded-3xl px-4 py-3 ${
                    item.role === 'user'
                      ? 'self-end rounded-br-lg bg-brand'
                      : 'self-start rounded-bl-lg bg-canvas'
                  }`}>
                  <Text
                    className={
                      item.role === 'user' ? 'leading-6 text-white' : 'leading-6 text-ink'
                    }>
                    {item.text}
                  </Text>
                </View>
              )}
            />
            <View className="gap-3 border-t border-line bg-surface p-4">
              {error ? (
                <AnimatedPresence className="rounded-2xl bg-dangerSoft p-3">
                  <Text className="font-semibold text-danger">{error}</Text>
                </AnimatedPresence>
              ) : null}
              <TextInput
                accessibilityLabel="Message for diet advisor"
                className="min-h-14 rounded-2xl border border-line bg-canvas px-4 py-3 text-base text-ink"
                multiline
                onChangeText={setDraft}
                placeholder="What should I eat after training?"
                placeholderTextColor="#77837D"
                value={draft}
              />
              <Button
                label="Ask advisor"
                loading={isSending}
                disabled={!draft.trim()}
                onPress={() => void sendMessage()}
              />
            </View>
          </View>
        </AppPage>
      </View>
    </KeyboardAvoidingView>
  );
}
