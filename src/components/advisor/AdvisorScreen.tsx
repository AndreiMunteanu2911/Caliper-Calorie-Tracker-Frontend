import {
  ChevronDown,
  ClipboardList,
  Dumbbell,
  Send,
  Sparkles,
  Utensils,
} from 'lucide-react-native';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';

import { AppPage } from '@/src/components/layout/AppPage';
import { PageHeader } from '@/src/components/layout/PageHeader';
import { AdvisorHistoryConversations } from '@/src/components/advisor/AdvisorHistoryConversations';
import { MarkdownMessage } from '@/src/components/advisor/MarkdownMessage';
import { Button } from '@/src/components/ui/Button';
import { InputBox } from '@/src/components/ui/InputBox';
import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
import { useAdvisorChat } from '@/src/hooks/useAdvisorChat';
import { MotionFade, MotionStagger } from '@/src/lib/motion';
import type { AdvisorMessage } from '@/src/types/api';

const HISTORY_MENU_MAX_WIDTH = 320;

const SUGGESTIONS = [
  { icon: Utensils, label: 'What should I eat next?' },
  { icon: Dumbbell, label: 'How can I hit my protein target?' },
  { icon: ClipboardList, label: 'Review what I ate today' },
] as const;

export function AdvisorScreen() {
  const listRef = useRef<ScrollView>(null);
  const historyButtonRef = useRef<View>(null);
  const [showConversations, setShowConversations] = useState(false);
  const [historyMenuPosition, setHistoryMenuPosition] = useState({
    left: 0,
    top: 0,
  });
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const {
    messages,
    draft,
    isLoadingHistory,
    isSending,
    error,
    conversations,
    activeConversationId,
    setDraft,
    sendMessage,
    switchConversation,
    createNewConversation,
  } =
    useAdvisorChat();

  const positionHistoryMenu = useCallback(() => {
    historyButtonRef.current?.measureInWindow((x, y, width, height) => {
      const menuWidth = Math.min(HISTORY_MENU_MAX_WIDTH, windowWidth - 24);
      setHistoryMenuPosition({
        left: Math.max(
          12,
          Math.min(x + width - menuWidth, windowWidth - menuWidth - 12),
        ),
        top: y + height + 8,
      });
    });
  }, [windowWidth]);

  useEffect(() => {
    if (showConversations) {
      positionHistoryMenu();
    }
  }, [positionHistoryMenu, showConversations]);

  function toggleHistory() {
    if (showConversations) {
      setShowConversations(false);
      return;
    }
    positionHistoryMenu();
    setShowConversations(true);
  }

  const historyListMaxHeight = Math.max(
    260,
    Math.min(560, windowHeight - historyMenuPosition.top - 132),
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-brand"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="flex-1 pb-32 pt-4">
        <AppPage className="flex-1 min-h-0">
          <View className="min-h-0 flex-1 gap-4">
            <View
              className="z-50 flex-row items-start justify-between gap-3"
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
              className="z-0 min-h-0 flex-1 overflow-hidden rounded-3xl border border-white/10 bg-[#1C1C1C] p-3 shadow-card">
              <ScrollbarContainer
                ref={listRef}
                className="min-h-0 flex-1 rounded-2xl border border-white/10 bg-[#141414] px-3.5 shadow-soft"
                contentContainerClassName="gap-3 py-3.5"
                keyboardDismissMode="interactive"
                keyboardShouldPersistTaps="handled"
                onContentSizeChange={() =>
                  listRef.current?.scrollToEnd({ animated: true })
                }
                onLayout={() => listRef.current?.scrollToEnd({ animated: false })}>
                {messages.length === 0 ? (
                  <View className="px-1 py-2">
                    <MotionFade className="items-center px-3 py-3.5">
                      <Text className="text-center text-base font-black text-white">
                        What are you solving today?
                      </Text>
                      <Text className="mt-1 max-w-xs text-center text-sm leading-5 text-white/45">
                        Ask for a meal idea, macro tradeoff, or a quick read on
                        today's logging pattern.
                      </Text>
                    </MotionFade>

                    <View className="mt-3 w-full gap-2">
                      {SUGGESTIONS.map(({ icon: Icon, label }, index) => (
                        <MotionStagger index={index} key={label}>
                          <Pressable
                            accessibilityRole="button"
                            className="w-full flex-row items-center gap-2.5 rounded-xl border border-white/10 bg-[#242424] px-3.5 py-2.5 active:bg-white/10"
                            onPress={() => setDraft(label)}>
                            <Icon color="#FF5A16" size={15} strokeWidth={2.5} />
                            <Text className="min-w-0 flex-1 text-sm font-bold text-white">
                              {label}
                            </Text>
                          </Pressable>
                        </MotionStagger>
                      ))}
                    </View>
                  </View>
                ) : (
                  messages.map((item: AdvisorMessage) => (
                    <MotionFade
                      className={`${
                        item.role === 'user'
                          ? 'max-w-[82%] self-end rounded-3xl rounded-br-lg bg-accent px-4 py-3 shadow-glow'
                          : 'w-full max-w-[96%] self-start rounded-3xl rounded-bl-lg border border-white/10 bg-[#232220] px-5 py-4'
                      }`}
                      key={item.id}>
                      {item.role === 'assistant' ? (
                        <View className="gap-3">
                          <View className="flex-row items-center gap-2">
                            <View className="h-6 w-6 items-center justify-center rounded-lg bg-accent/15">
                              <Sparkles
                                color="#FF5A16"
                                size={13}
                                strokeWidth={2.5}
                              />
                            </View>
                            <Text className="text-xs font-black uppercase tracking-widest text-white/35">
                              Advisor
                            </Text>
                          </View>
                          <MarkdownMessage content={item.content} />
                        </View>
                      ) : (
                        <Text className="text-sm font-semibold leading-6 text-white">
                          {item.content}
                        </Text>
                      )}
                    </MotionFade>
                  ))
                )}
                {isSending &&
                !messages.some((item) => item.id.startsWith('streaming-')) ? (
                  <MotionFade className="self-start rounded-3xl rounded-bl-lg border border-white/10 bg-[#252525] px-4 py-3">
                    <Text className="text-sm font-semibold text-white/55">
                      Thinking...
                    </Text>
                  </MotionFade>
                ) : null}
              </ScrollbarContainer>
              <View className="mt-3 gap-2">
                {error ? (
                  <MotionFade className="rounded-2xl bg-dangerSoft p-2.5">
                    <Text className="font-semibold text-danger">{error}</Text>
                  </MotionFade>
                ) : null}
                <View className="rounded-2xl border border-white/10 bg-[#232220] p-2">
                  <View className="flex-row items-center gap-2">
                    <InputBox
                      accessibilityLabel="Message for diet advisor"
                      containerClassName="min-w-0 flex-1"
                      dense={true}
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
          </View>
        </AppPage>
      </View>
      <AdvisorHistoryConversations
        activeConversationId={activeConversationId}
        conversations={conversations}
        isLoading={isLoadingHistory}
        left={historyMenuPosition.left}
        maxListHeight={historyListMaxHeight}
        top={historyMenuPosition.top}
        visible={showConversations}
        width={Math.min(HISTORY_MENU_MAX_WIDTH, windowWidth - 24)}
        onClose={() => setShowConversations(false)}
        onCreateConversation={() => {
          setShowConversations(false);
          void createNewConversation();
        }}
        onSelectConversation={(conversationId) => {
          setShowConversations(false);
          void switchConversation(conversationId);
        }}
      />
    </KeyboardAvoidingView>
  );
}
