import { FlatList, KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { useAdvisorChat } from '@/src/hooks/useAdvisorChat';

export function AdvisorScreen() {
  const { messages, draft, isSending, error, setDraft, sendMessage } =
    useAdvisorChat();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-canvas"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="px-5 pb-4 pt-16">
        <Text className="text-sm font-semibold uppercase tracking-widest text-lime">
          Live macro context
        </Text>
        <Text className="text-4xl font-bold text-white">Diet advisor</Text>
      </View>
      <FlatList
        className="flex-1 px-5"
        contentContainerClassName="gap-3 py-4"
        data={messages}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text className="text-base text-muted">
            Ask for a meal idea, pre-workout adjustment, or a way to hit today&apos;s
            protein target.
          </Text>
        }
        renderItem={({ item }) => (
          <View
            className={`max-w-[88%] rounded-2xl p-4 ${
              item.role === 'user' ? 'self-end bg-lime' : 'self-start bg-panel'
            }`}>
            <Text className={item.role === 'user' ? 'text-canvas' : 'text-white'}>
              {item.text}
            </Text>
          </View>
        )}
      />
      <View className="gap-3 border-t border-white/10 bg-canvas p-5">
        {error ? <Text className="text-red-300">{error}</Text> : null}
        <TextInput
          accessibilityLabel="Message for diet advisor"
          className="min-h-14 rounded-2xl bg-panel px-4 py-3 text-base text-white"
          multiline
          onChangeText={setDraft}
          placeholder="What should I eat after training?"
          placeholderTextColor="#8da399"
          value={draft}
        />
        <PrimaryButton
          label="Ask advisor"
          loading={isSending}
          disabled={!draft.trim()}
          onPress={() => void sendMessage()}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
