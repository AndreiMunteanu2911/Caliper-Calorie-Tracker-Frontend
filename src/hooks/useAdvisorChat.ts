import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { apiRequest, streamApiRequest } from '@/src/lib/api-client';
import type {
  AdvisorConversation,
  AdvisorMessage,
} from '@/src/types/api';

type ChatStreamEvent =
  | { type: 'delta'; content: string }
  | {
      type: 'done';
      conversation_id: string;
      user_message: AdvisorMessage;
      assistant_message: AdvisorMessage;
    }
  | { type: 'error'; message: string };

type ConversationSummary = {
  id: string;
  title: string;
};

export function useAdvisorChat() {
  const [messages, setMessages] = useState<AdvisorMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const loadedConversationRef = useRef<string | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      setConversations(
        await apiRequest<ConversationSummary[]>('/ai/conversations'),
      );
    } catch {
      // silently fail
    }
  }, []);

  const switchConversation = useCallback(async (id: string) => {
    setActiveConversationId(id);
    loadedConversationRef.current = id;
    setIsLoadingHistory(true);
    setError(null);
    try {
      const conversation = await apiRequest<AdvisorConversation>(
        `/ai/chat?conversation_id=${encodeURIComponent(id)}`,
        { timeoutMs: 12_000 },
      );
      setMessages(conversation.messages);
    } catch (requestError) {
      setMessages([]);
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load conversation.',
      );
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const createNewConversation = useCallback(async () => {
    try {
      const { id } = await apiRequest<{ id: string }>('/ai/conversations', {
        method: 'POST',
      });
      setActiveConversationId(id);
      loadedConversationRef.current = id;
      setMessages([]);
      setError(null);
      await loadConversations();
    } catch {
      // silently fail
    }
  }, [loadConversations]);

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    setError(null);
    try {
      const conversation = await apiRequest<AdvisorConversation>('/ai/chat', {
        timeoutMs: 12_000,
      });
      loadedConversationRef.current = conversation.id || null;
      setActiveConversationId(conversation.id || null);
      setMessages((current) =>
        current.length === 0 ? conversation.messages : current,
      );
      await loadConversations();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load advisor history.',
      );
    } finally {
      setIsLoadingHistory(false);
    }
  }, [loadConversations]);

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
          conversation_id: activeConversationId,
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
        loadedConversationRef.current = event.conversation_id;
        setActiveConversationId(event.conversation_id);
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
      await loadConversations();
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
    conversations,
    activeConversationId,
    setDraft,
    sendMessage,
    loadHistory,
    switchConversation,
    createNewConversation,
    loadConversations,
  };
}
