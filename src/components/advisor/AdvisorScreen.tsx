import { RefreshCcw, Send, Sparkles } from 'lucide-react-native';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  type ScrollView,
  Text,
  View,
} from 'react-native';
import { useRef } from 'react';

import { AppPage } from '@/src/components/layout/AppPage';
import { PageHeader } from '@/src/components/layout/PageHeader';
import { MarkdownMessage } from '@/src/components/advisor/MarkdownMessage';
import { AnimatedPresence } from '@/src/components/ui/AnimatedPresence';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { InputBox } from '@/src/components/ui/InputBox';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
import { useAdvisorChat } from '@/src/hooks/useAdvisorChat';
import type { AdvisorMessage } from '@/src/types/api';

const SUGGESTIONS = [
  'What should I eat next?',
  'How can I hit my protein target?',
  'Review what I ate today',
] as const;

export function AdvisorScreen() {
  const listRef = useRef<ScrollView>(null);
  const {
    messages,
    draft,
    isLoadingHistory,
    isSending,
    error,
    setDraft,
    sendMessage,
    loadHistory,
  } =
    useAdvisorChat();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-brand"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="flex-1 px-4 pb-24 pt-5 sm:px-6">
        <AppPage className="flex-1 min-h-0">
          <View className="min-h-0 flex-1 gap-4">
            <PageHeader
              title="AI Advisor"
              description="Get practical guidance grounded in today's foods, remaining macros, and your recent nutrition history."
            />

            <View
              className="min-h-0 flex-1 overflow-hidden rounded-[32px] border border-white/10 bg-[#1C1C1C] p-3 shadow-card">
              <ScrollbarContainer
                ref={listRef}
                className="min-h-0 flex-1 rounded-[22px] border border-white/10 bg-[#141414] px-4 shadow-soft"
                contentContainerClassName="gap-3 py-5"
                keyboardDismissMode="interactive"
                keyboardShouldPersistTaps="handled"
                onContentSizeChange={() =>
                  listRef.current?.scrollToEnd({ animated: true })
                }
                onLayout={() => listRef.current?.scrollToEnd({ animated: false })}>
                {messages.length === 0 ? (
                  <View className="items-center px-4 py-12">
                    <Text className="text-xl font-black text-white">How can I help?</Text>
                    <Text className="mt-2 max-w-sm text-center leading-6 text-white/55">
                      I can use today&apos;s foods, remaining macros, and your recent
                      nutrition history.
                    </Text>
                    <View className="mt-6 w-full gap-2">
                      {SUGGESTIONS.map((suggestion) => (
                        <Pressable
                          accessibilityRole="button"
                          className="w-full flex-row items-center gap-3 rounded-2xl border border-white/10 bg-[#242424] px-4 py-3.5"
                          key={suggestion}
                          onPress={() => setDraft(suggestion)}>
                          <Sparkles color="#FF5A16" size={16} strokeWidth={2.5} />
                          <Text className="min-w-0 flex-1 text-sm font-bold text-white">
                            {suggestion}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    {isLoadingHistory ? (
                      <View className="mt-5 flex-row items-center gap-2">
                        <LoadingSpinner />
                        <Text className="text-sm text-white/45">Loading history...</Text>
                      </View>
                    ) : error ? (
                      <Pressable
                        accessibilityRole="button"
                        className="mt-5 flex-row items-center gap-2 rounded-full bg-white/10 px-4 py-3"
                        onPress={() => void loadHistory()}>
                        <RefreshCcw color="#FFFFFF" size={16} />
                        <Text className="font-bold text-white">Retry history</Text>
                      </Pressable>
                    ) : null}
                  </View>
                ) : (
                  messages.map((item: AdvisorMessage) => (
                    <AnimatedPresence
                      animateLayout={false}
                      className={`rounded-3xl ${
                        item.role === 'user'
                          ? 'max-w-[82%] self-end rounded-br-lg bg-accent px-4 py-3'
                          : 'w-full max-w-[96%] self-start rounded-bl-lg border border-white/10 bg-[#252525] px-5 py-4'
                      }`}
                      key={item.id}>
                      {item.role === 'assistant' ? (
                        <MarkdownMessage content={item.content} />
                      ) : (
                        <Text className="text-[15px] font-semibold leading-6 text-white">
                          {item.content}
                        </Text>
                      )}
                    </AnimatedPresence>
                  ))
                )}
                {isSending &&
                !messages.some((item) => item.id.startsWith('streaming-')) ? (
                  <AnimatedPresence
                    animateLayout={false}
                    className="self-start rounded-3xl rounded-bl-lg border border-white/10 bg-[#252525] px-5 py-4">
                    <Text className="text-sm font-semibold text-white/55">
                      Thinking...
                    </Text>
                  </AnimatedPresence>
                ) : null}
              </ScrollbarContainer>
              <View className="mt-3 gap-2">
                {error ? (
                  <AnimatedPresence className="rounded-2xl bg-dangerSoft p-3">
                    <Text className="font-semibold text-danger">{error}</Text>
                  </AnimatedPresence>
                ) : null}
                <View className="flex-row items-center gap-3">
                  <InputBox
                    accessibilityLabel="Message for diet advisor"
                    containerClassName="min-w-0 flex-1"
                    inputClassName="max-h-28"
                    multiline
                    onChangeText={setDraft}
                    placeholder="Message your nutrition advisor..."
                    placeholderTextColor="#8F8F8F"
                    value={draft}
                  />
                  <Pressable
                    accessibilityLabel="Send message"
                    accessibilityRole="button"
                    className={`h-14 w-14 items-center justify-center rounded-full bg-accent ${
                      !draft.trim() || isSending ? 'opacity-40' : ''
                    }`}
                    disabled={!draft.trim() || isSending}
                    onPress={() => void sendMessage()}>
                    <Send color="#FFFFFF" size={21} />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </AppPage>
      </View>
    </KeyboardAvoidingView>
  );
}
