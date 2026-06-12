import { supabase } from '@/src/lib/supabase';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error('EXPO_PUBLIC_API_URL must be configured.');
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

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  return executeRequest<T>(path, options, true);
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
      const { error } = await supabase.auth.refreshSession();
      if (!error) {
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
