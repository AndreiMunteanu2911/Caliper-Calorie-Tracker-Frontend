import {
  Bot,
  Send,
  Sparkles,
} from 'lucide-react-native';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppPage } from '@/src/components/layout/AppPage';
import { PageHeader } from '@/src/components/layout/PageHeader';
import { Button } from '@/src/components/ui/Button';
import { AnimatedPresence } from '@/src/components/ui/AnimatedPresence';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { useAdvisorChat } from '@/src/hooks/useAdvisorChat';

const SUGGESTIONS = [
  'What should I eat next?',
  'How can I hit my protein target?',
  'Review what I ate today',
] as const;

export function AdvisorScreen() {
  const {
    messages,
    draft,
    isLoadingHistory,
    isSending,
    error,
    setDraft,
    sendMessage,
  } =
    useAdvisorChat();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-brand"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="flex-1 px-4 pb-28 pt-6 sm:px-6 sm:pt-10">
        <AppPage>
          <View className="gap-6">
            <PageHeader
              eyebrow="Nutrition intelligence"
              title="AI Advisor"
              description="Get practical guidance grounded in today's foods, remaining macros, and your recent nutrition history."
            />

            <View className="flex-row flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <Pressable
                  accessibilityRole="button"
                  className="flex-row items-center gap-2 rounded-2xl border border-white/10 bg-[#242424] px-4 py-3 shadow-card"
                  key={suggestion}
                  onPress={() => setDraft(suggestion)}>
                  <Sparkles color="#FF5A2F" size={15} strokeWidth={2.5} />
                  <Text className="text-sm font-bold text-white">{suggestion}</Text>
                </Pressable>
              ))}
            </View>

            <View
              className="flex-1 overflow-hidden rounded-[32px] border border-white/10 bg-[#1C1C1C] p-3 shadow-card"
              style={{ minHeight: Platform.OS === 'web' ? 560 : undefined }}>
              <View className="flex-row items-center justify-between px-3 pb-4 pt-2">
                <View>
                  <Text className="text-sm font-black text-white">Nutrition advisor</Text>
                  <Text className="mt-1 text-xs text-white/55">
                    Conversation history is saved securely.
                  </Text>
                </View>
                <View className="h-10 w-10 items-center justify-center rounded-full bg-protein">
                  <Bot color="#101010" size={19} strokeWidth={2.5} />
                </View>
              </View>
              <FlatList
                className="flex-1 rounded-[22px] border border-white/10 bg-[#141414] px-4 shadow-soft"
                contentContainerClassName="gap-3 py-5"
                data={messages}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                  isLoadingHistory ? (
                    <View className="items-center px-4 py-12">
                      <LoadingSpinner />
                      <Text className="mt-3 text-white/55">
                        Loading your conversation...
                      </Text>
                    </View>
                  ) : (
                    <View className="items-center px-4 py-12">
                      <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-carbs">
                        <Bot color="#101010" size={27} strokeWidth={2.5} />
                      </View>
                      <Text className="text-xl font-black text-white">How can I help?</Text>
                      <Text className="mt-2 max-w-sm text-center leading-6 text-white/55">
                        I can use today&apos;s foods, remaining macros, and your recent
                        nutrition history.
                      </Text>
                    </View>
                  )
                }
                renderItem={({ item }) => (
                  <View
                    className={`max-w-[88%] rounded-3xl px-4 py-3 ${
                      item.role === 'user'
                        ? 'self-end rounded-br-lg bg-accent'
                        : 'self-start rounded-bl-lg border border-white/10 bg-[#292929]'
                    }`}>
                    <Text className="leading-6 text-white">
                      {item.content}
                    </Text>
                  </View>
                )}
              />
              <View className="mt-3 gap-3 rounded-[22px] border border-white/10 bg-[#242424] p-4 shadow-soft">
                {error ? (
                  <AnimatedPresence className="rounded-2xl bg-dangerSoft p-3">
                    <Text className="font-semibold text-danger">{error}</Text>
                  </AnimatedPresence>
                ) : null}
                <TextInput
                  accessibilityLabel="Message for diet advisor"
                  className="min-h-14 rounded-2xl border border-white/10 bg-[#161616] px-4 py-3 text-base text-white"
                  multiline
                  onChangeText={setDraft}
                  placeholder="What should I eat after training?"
                  placeholderTextColor="#8F8F8F"
                  value={draft}
                />
                <Button
                  label="Ask advisor"
                  icon={Send}
                  loading={isSending}
                  disabled={!draft.trim() || isLoadingHistory}
                  onPress={() => void sendMessage()}
                />
              </View>
            </View>
          </View>
        </AppPage>
      </View>
    </KeyboardAvoidingView>
  );
}
