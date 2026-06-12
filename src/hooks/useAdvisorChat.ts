import { useState } from 'react';

import { apiRequest } from '@/src/lib/api-client';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

export function useAdvisorChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage() {
    const trimmed = draft.trim();
    if (!trimmed || isSending) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      text: trimmed,
    };
    setMessages((current) => [...current, userMessage]);
    setDraft('');
    setIsSending(true);
    setError(null);
    try {
      const response = await apiRequest<{ message: string }>('/ai/chat', {
        method: 'POST',
        timeoutMs: 90_000,
        body: {
          message: trimmed,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          history: messages.slice(-20).map((item) => ({
            role: item.role,
            content: item.text,
          })),
        },
      });
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          text: response.message,
        },
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'Unable to send message.',
      );
    } finally {
      setIsSending(false);
    }
  }

  return { messages, draft, isSending, error, setDraft, sendMessage };
}
