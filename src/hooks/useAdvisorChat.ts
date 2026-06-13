import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { apiRequest, streamApiRequest } from '@/src/lib/api-client';
import type {
  AdvisorConversation,
  AdvisorMessage,
} from '@/src/types/api';

type ChatStreamEvent =
  | { type: 'delta'; content: string }
  | {
      type: 'done';
      user_message: AdvisorMessage;
      assistant_message: AdvisorMessage;
    }
  | { type: 'error'; message: string };

export function useAdvisorChat() {
  const [messages, setMessages] = useState<AdvisorMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    setError(null);
    try {
      const conversation = await apiRequest<AdvisorConversation>('/ai/chat', {
        timeoutMs: 12_000,
      });
      setMessages((current) =>
        current.length === 0 ? conversation.messages : current,
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load advisor history.',
      );
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadHistory();
    }, [loadHistory]),
  );

  async function sendMessage() {
    const trimmed = draft.trim();
    if (!trimmed || isSending) return;

    const pendingId = `pending-${Date.now()}`;
    const streamingId = `streaming-${Date.now()}`;
    const pendingMessage: AdvisorMessage = {
      id: pendingId,
      role: 'user',
      content: trimmed,
      created_at: new Date().toISOString(),
    };
    setMessages((current) => [...current, pendingMessage]);
    setDraft('');
    setIsSending(true);
    setError(null);
    try {
      let receivedContent = '';
      let completed = false;
      await streamApiRequest<ChatStreamEvent>('/ai/chat/stream', {
        method: 'POST',
        timeoutMs: 90_000,
        body: {
          message: trimmed,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        },
      }, (event) => {
        if (event.type === 'error') {
          throw new Error(event.message);
        }
        if (event.type === 'delta') {
          receivedContent += event.content;
          setMessages((current) => {
            const hasStreamingMessage = current.some(
              (item) => item.id === streamingId,
            );
            if (!hasStreamingMessage) {
              return [
                ...current,
                {
                  id: streamingId,
                  role: 'assistant',
                  content: receivedContent,
                  created_at: new Date().toISOString(),
                },
              ];
            }
            return current.map((item) =>
              item.id === streamingId
                ? { ...item, content: receivedContent }
                : item,
            );
          });
          return;
        }
        completed = true;
        setMessages((current) => [
          ...current.filter(
            (item) => item.id !== pendingId && item.id !== streamingId,
          ),
          event.user_message,
          event.assistant_message,
        ]);
      });
      if (!completed) {
        throw new Error('The streamed response ended unexpectedly.');
      }
    } catch (requestError) {
      setMessages((current) =>
        current.filter(
          (item) => item.id !== pendingId && item.id !== streamingId,
        ),
      );
      setDraft(trimmed);
      setError(
        requestError instanceof Error ? requestError.message : 'Unable to send message.',
      );
    } finally {
      setIsSending(false);
    }
  }

  return {
    messages,
    draft,
    isLoadingHistory,
    isSending,
    error,
    setDraft,
    sendMessage,
    loadHistory,
  };
}
