import { supabase } from '@/src/lib/supabase';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!apiUrl || !supabaseAnonKey) {
  throw new Error(
    'EXPO_PUBLIC_API_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY must be configured.',
  );
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  timeoutMs?: number;
};

type ErrorEnvelope = {
  error?: {
    code?: string;
    message?: string;
  };
  detail?: string;
};

let refreshSessionPromise: ReturnType<typeof supabase.auth.refreshSession> | null =
  null;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
  }
}

async function refreshAuthSession(): Promise<boolean> {
  if (!refreshSessionPromise) {
    refreshSessionPromise = supabase.auth.refreshSession().finally(() => {
      refreshSessionPromise = null;
    });
  }
  const { data, error } = await refreshSessionPromise;
  return !error && Boolean(data.session);
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  return executeRequest<T>(path, options, true);
}

export async function streamApiRequest<T>(
  path: string,
  options: RequestOptions,
  onEvent: (event: T) => void,
): Promise<void> {
  return executeStreamRequest(path, options, onEvent, true);
}

async function executeStreamRequest<T>(
  path: string,
  options: RequestOptions,
  onEvent: (event: T) => void,
  canRetryAuth: boolean,
): Promise<void> {
  const { body, timeoutMs = 90_000, ...requestInit } = options;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers = new Headers(requestInit.headers);
  headers.set('Accept', 'application/x-ndjson');
  headers.set('Content-Type', 'application/json');
  headers.set('X-Supabase-Api-Key', supabaseAnonKey);
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${apiUrl}${path}`, {
      ...requestInit,
      body: body === undefined ? undefined : JSON.stringify(body),
      headers,
      signal: controller.signal,
    });

    if (response.status === 401 && canRetryAuth) {
      if (await refreshAuthSession()) {
        return executeStreamRequest(path, options, onEvent, false);
      }
    }
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as ErrorEnvelope | null;
      throw new ApiError(
        payload?.error?.message ??
          payload?.detail ??
          'The request could not be completed.',
        response.status,
        payload?.error?.code ?? 'request_failed',
      );
    }

    let buffer = '';
    const processChunk = (chunk: string) => {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (line.trim()) onEvent(JSON.parse(line) as T);
      }
    };

    const reader = response.body?.getReader?.();
    if (!reader) {
      processChunk(await response.text());
    } else {
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        processChunk(decoder.decode(value, { stream: true }));
      }
      processChunk(decoder.decode());
    }
    if (buffer.trim()) {
      onEvent(JSON.parse(buffer) as T);
    }
  } finally {
    clearTimeout(timeout);
  }
}

async function executeRequest<T>(
  path: string,
  options: RequestOptions,
  canRetryAuth: boolean,
): Promise<T> {
  const { body, timeoutMs = 30_000, ...requestInit } = options;
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(requestInit.headers);
  headers.set('Accept', 'application/json');
  headers.set('X-Supabase-Api-Key', supabaseAnonKey);
  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  const controller = new AbortController();
  const abort = () => controller.abort();
  requestInit.signal?.addEventListener('abort', abort, { once: true });
  let didTimeout = false;
  const timeout = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...requestInit,
      signal: controller.signal,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (requestError) {
    if (didTimeout) {
      throw new ApiError('The request timed out. Please try again.', 408, 'timeout');
    }
    throw requestError;
  } finally {
    clearTimeout(timeout);
    requestInit.signal?.removeEventListener('abort', abort);
  }
  if (!response.ok) {
    if (response.status === 401 && canRetryAuth) {
      if (await refreshAuthSession()) {
        return executeRequest<T>(path, options, false);
      }
    }
    const payload = (await response.json().catch(() => null)) as ErrorEnvelope | null;
    const detail =
      payload?.error && typeof payload.error.message === 'string'
        ? payload.error.message
        : payload && typeof payload.detail === 'string'
        ? payload.detail
        : 'The request could not be completed.';
    throw new ApiError(
      detail,
      response.status,
      payload?.error?.code ?? 'request_failed',
    );
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}
