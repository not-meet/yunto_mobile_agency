import type { z } from 'zod';

import type { RequestOptions } from '@/utils/api';

// TEMPORARY: stand-in for apiRequest until the backend is available. Delete src/mocks/
// and swap `mockApiRequest` → `apiRequest` (dropping the `mock` option) in src/services/.
//
// Same contract as apiRequest: the body is validated with the `request` schema and the
// mock's result is parsed with the `response` schema, so services are already type-safe
// against the real shapes. `mock` must return the schema's input type, so bad fixtures
// fail at compile time.

const MOCK_LATENCY_MS = 1500;

export interface MockRequestOptions<
  TReq extends z.ZodType,
  TRes extends z.ZodType,
> extends RequestOptions<TReq, TRes> {
  mock: (payload: z.output<TReq> | undefined) => z.input<TRes>;
}

export async function mockApiRequest<TReq extends z.ZodType, TRes extends z.ZodType>({
  request,
  body,
  response,
  mock,
}: MockRequestOptions<TReq, TRes>): Promise<z.output<TRes>> {
  const payload = request ? request.parse(body) : undefined;
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
  return response.parse(mock(payload));
}
