import { Check, MessageCircle, Plus } from 'lucide-react-native';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ScrollbarContainer } from '@/src/components/ui/ScrollbarContainer';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { MotionFade, MotionPressable, MotionStagger } from '@/src/lib/motion';

type ConversationSummary = {
  id: string;
  title: string;
};

type AdvisorHistoryConversationsProps = {
  activeConversationId: string | null;
  conversations: ConversationSummary[];
  isLoading: boolean;
  left: number;
  maxListHeight: number;
  onClose: () => void;
  onCreateConversation: () => void;
  onSelectConversation: (id: string) => void;
  top: number;
  visible: boolean;
  width: number;
};

export function AdvisorHistoryConversations({
  activeConversationId,
  conversations,
  isLoading,
  left,
  maxListHeight,
  onClose,
  onCreateConversation,
  onSelectConversation,
  top,
  visible,
  width,
}: AdvisorHistoryConversationsProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}>
      <View style={StyleSheet.absoluteFill}>
        <Pressable
          accessibilityLabel="Close conversation history"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <MotionFade
          distance={3}
          scaleFrom={0.98}
          style={{
            left,
            position: 'absolute',
            top,
            width,
            zIndex: 50,
          }}>
          <View
            className="overflow-hidden rounded-3xl border border-white/10 bg-[#1C1C1C] shadow-card"
            style={{
              elevation: 40,
              ...(Platform.OS === 'web'
                ? { boxShadow: '0 18px 42px rgba(0, 0, 0, 0.36)' }
                : {
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 18 },
                    shadowOpacity: 0.34,
                    shadowRadius: 34,
                  }),
            }}>
            <View className="border-b border-white/10 bg-[#232220] px-4 py-3">
              <Text className="text-sm font-black text-white">
                Conversation history
              </Text>
            </View>

            <MotionPressable
              className="flex-row items-center gap-3 border-b border-white/10 px-4 py-3 active:bg-white/5"
              onPress={onCreateConversation}>
              <View className="h-8 w-8 items-center justify-center rounded-xl bg-accent">
                <Plus color="#FFFFFF" size={16} strokeWidth={2.5} />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-sm font-black text-white">
                  New conversation
                </Text>
                <Text className="text-xs font-semibold text-white/35">
                  Start from a clean chat
                </Text>
              </View>
            </MotionPressable>

            <ScrollbarContainer
              contentContainerClassName="gap-0.5 p-1.5"
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: maxListHeight }}>
              {isLoading ? (
                <View className="flex-row items-center justify-center gap-3 px-4 py-7">
                  <LoadingSpinner />
                  <Text className="text-sm font-semibold text-white/45">
                    Loading history...
                  </Text>
                </View>
              ) : conversations.length > 0 ? (
                conversations.map((conversation, index) => {
                  const isActive = conversation.id === activeConversationId;
                  return (
                    <MotionStagger index={index} key={conversation.id}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ selected: isActive }}
                        className={`flex-row items-center gap-2.5 rounded-xl border px-4 py-2 ${
                          isActive
                            ? 'border-accent/60 bg-accent/10'
                            : 'border-transparent active:bg-white/5'
                        }`}
                        onPress={() => onSelectConversation(conversation.id)}>
                        <View
                          className={`h-8 w-8 items-center justify-center rounded-xl ${
                            isActive ? 'bg-accent' : 'bg-white/10'
                          }`}>
                          {isActive ? (
                            <Check color="#FFFFFF" size={16} strokeWidth={3} />
                          ) : (
                            <MessageCircle
                              color="#A8A8A8"
                              size={16}
                              strokeWidth={2.5}
                            />
                          )}
                        </View>
                        <View className="min-w-0 flex-1">
                          <Text
                            className="text-sm font-black text-white"
                            numberOfLines={1}>
                            {conversation.title}
                          </Text>
                          <Text className="text-xs font-semibold text-white/35">
                            Nutrition advisor
                          </Text>
                        </View>
                      </Pressable>
                    </MotionStagger>
                  );
                })
              ) : (
                <View className="items-center px-5 py-8">
                  <View className="mb-3 h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                    <MessageCircle color="#8F8F8F" size={18} strokeWidth={2.4} />
                  </View>
                  <Text className="text-center text-sm font-black text-white">
                    No conversations yet
                  </Text>
                  <Text className="mt-1 text-center text-xs leading-5 text-white/35">
                    Your advisor chats will appear here after you send a message.
                  </Text>
                </View>
              )}
            </ScrollbarContainer>
          </View>
        </MotionFade>
      </View>
    </Modal>
  );
}
