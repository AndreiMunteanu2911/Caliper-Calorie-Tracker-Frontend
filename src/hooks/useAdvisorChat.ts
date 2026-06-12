import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { apiRequest } from '@/src/lib/api-client';
import type {
  AdvisorConversation,
  AdvisorMessage,
  ChatResponse,
} from '@/src/types/api';

export function useAdvisorChat() {
  const [messages, setMessages] = useState<AdvisorMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    setError(null);
    try {
      const conversation = await apiRequest<AdvisorConversation>('/ai/chat');
      setMessages(conversation.messages);
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
      const response = await apiRequest<ChatResponse>('/ai/chat', {
        method: 'POST',
        timeoutMs: 90_000,
        body: {
          message: trimmed,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        },
      });
      setMessages((current) => [
        ...current.filter((item) => item.id !== pendingId),
        response.user_message,
        response.assistant_message,
      ]);
    } catch (requestError) {
      setMessages((current) => current.filter((item) => item.id !== pendingId));
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
