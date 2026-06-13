import { ChevronDown, Plus, Send, Sparkles } from 'lucide-react-native';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRef, useState } from 'react';

import { AppPage } from '@/src/components/layout/AppPage';
import { PageHeader } from '@/src/components/layout/PageHeader';
import { MarkdownMessage } from '@/src/components/advisor/MarkdownMessage';
import { AnimatedPresence } from '@/src/components/ui/AnimatedPresence';
import { Button } from '@/src/components/ui/Button';
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
  const historyButtonRef = useRef<View>(null);
  const [showConversations, setShowConversations] = useState(false);
  const [historyMenuPosition, setHistoryMenuPosition] = useState({
    left: 0,
    top: 0,
  });
  const { width: windowWidth } = useWindowDimensions();
  const {
    messages,
    draft,
    isLoadingHistory,
    isSending,
    error,
    conversations,
    setDraft,
    sendMessage,
    switchConversation,
    createNewConversation,
  } =
    useAdvisorChat();

  function toggleHistory() {
    if (showConversations) {
      setShowConversations(false);
      return;
    }
    historyButtonRef.current?.measureInWindow((x, y, width, height) => {
      const menuWidth = Math.min(288, windowWidth - 24);
      setHistoryMenuPosition({
        left: Math.max(12, Math.min(x + width - menuWidth, windowWidth - menuWidth - 12)),
        top: y + height + 8,
      });
      setShowConversations(true);
    });
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-brand"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="flex-1 px-4 pb-24 pt-5 sm:px-6">
        <AppPage className="flex-1 min-h-0">
          <View className="min-h-0 flex-1 gap-4">
            <View
              className="z-50 flex-row items-start justify-between gap-4"
              style={{ elevation: 30 }}>
              <View className="flex-1">
                <PageHeader
                  title="AI Advisor"
                  description="Get practical guidance grounded in today's foods, remaining macros, and your recent nutrition history."
                />
              </View>
              <View
                ref={historyButtonRef}
                collapsable={false}
                className="z-50 items-end pt-2">
                <Button
                  accessibilityLabel="Conversation history"
                  icon={ChevronDown}
                  label="History"
                  size="compact"
                  variant="secondary"
                  onPress={toggleHistory}
                />
              </View>
            </View>

            <View
              className="z-0 min-h-0 flex-1 overflow-hidden rounded-[32px] border border-white/10 bg-[#1C1C1C] p-3 shadow-card">
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
                    dense={true}
                    inputClassName="max-h-28"
                    multiline
                    onChangeText={setDraft}
                    placeholder="Message your nutrition advisor..."
                    placeholderTextColor="#8F8F8F"
                    value={draft}
                  />
                  <Button
                    accessibilityLabel="Send message"
                    disabled={!draft.trim() || isSending}
                    icon={Send}
                    iconPosition="left"
                    label="Send"
                    size="compact"
                    onPress={() => void sendMessage()}
                  />
                </View>
              </View>
          </View>
          </View>
        </AppPage>
      </View>
      <Modal
        animationType="fade"
        onRequestClose={() => setShowConversations(false)}
        statusBarTranslucent
        transparent
        visible={showConversations}>
        <View style={StyleSheet.absoluteFill}>
          <Pressable
            accessibilityLabel="Close conversation history"
            onPress={() => setShowConversations(false)}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={{
              backgroundColor: '#1C1C1C',
              borderColor: '#6B6B6B',
              borderRadius: 22,
              borderWidth: 1,
              elevation: 40,
              left: historyMenuPosition.left,
              overflow: 'hidden',
              position: 'absolute',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 16 },
              shadowOpacity: 0.32,
              shadowRadius: 28,
              top: historyMenuPosition.top,
              width: Math.min(288, windowWidth - 24),
            }}>
            <Pressable
              className="flex-row items-center gap-2 border-b border-[#4A4A4A] px-4 py-3.5 active:bg-white/5"
              onPress={() => {
                setShowConversations(false);
                void createNewConversation();
              }}>
              <Plus color="#FF5A16" size={16} strokeWidth={2.5} />
              <Text className="font-bold text-accent">New conversation</Text>
            </Pressable>
            <ScrollView
              className="caliper-scrollbar"
              contentContainerClassName="py-1"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
              style={{ maxHeight: 320 }}>
              {isLoadingHistory ? (
                <View className="flex-row items-center justify-center gap-3 px-4 py-8">
                  <LoadingSpinner />
                  <Text className="text-sm font-semibold text-white/45">
                    Loading history...
                  </Text>
                </View>
              ) : conversations.length > 0 ? (
                conversations.map((conv) => (
                  <Pressable
                    className="mx-1 rounded-xl px-3 py-3.5 active:bg-white/5"
                    key={conv.id}
                    onPress={() => {
                      setShowConversations(false);
                      void switchConversation(conv.id);
                    }}>
                    <Text className="text-sm font-bold text-white" numberOfLines={1}>
                      {conv.title}
                    </Text>
                  </Pressable>
                ))
              ) : (
                <View className="px-4 py-8">
                  <Text className="text-center text-sm text-white/35">
                    No conversations yet
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
