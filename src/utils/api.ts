import { randomUUID } from 'expo-crypto';
import { z } from 'zod';

import { getAuthToken } from '@/utils/auth';
import { API_BASE_URL, API_TIMEOUT_MS } from '@/utils/constants';

// Low-level HTTP client. Only call this from src/services/ — see CONVENTIONS.md.

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Every failure body is `{ message, code }`. `code` is what the UI branches on.
const apiErrorBodySchema = z.object({ message: z.string(), code: z.string().optional() });

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get code(): string | undefined {
    const parsed = apiErrorBodySchema.safeParse(this.body);
    return parsed.success ? parsed.data.code : undefined;
  }
}

export function apiErrorCode(error: unknown): string | undefined {
  return error instanceof ApiError ? error.code : undefined;
}

// One UUID per user action, reused if that same action is retried.
export function newIdempotencyKey(): string {
  return randomUUID();
}

export interface RequestOptions<TReq extends z.ZodType, TRes extends z.ZodType> {
  method: HttpMethod;
  path: string;
  response: TRes;
  request?: TReq;
  body?: z.input<TReq>;
  auth?: boolean;
  // Sent as Idempotency-Key so a retried write isn't applied twice.
  idempotencyKey?: string;
}

export async function apiRequest<TReq extends z.ZodType, TRes extends z.ZodType>({
  method,
  path,
  response,
  request,
  body,
  auth = true,
  idempotencyKey,
}: RequestOptions<TReq, TRes>): Promise<z.output<TRes>> {
  const payload = request ? request.parse(body) : undefined;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (payload !== undefined) headers['Content-Type'] = 'application/json';
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  if (auth) {
    const token = await getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: payload !== undefined ? JSON.stringify(payload) : undefined,
      signal: controller.signal,
    });
    const json: unknown = res.status === 204 ? null : await res.json().catch(() => null);

    if (!res.ok) throw new ApiError(`Request failed: ${method} ${path}`, res.status, json);

    return response.parse(json);
  } finally {
    clearTimeout(timeout);
  }
}
