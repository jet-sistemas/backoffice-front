import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { memberApi } from '@/api/member-api'

import { useMemberListQuery } from './use-member-list-query'

vi.mock('@/api/member-api', () => ({
  memberApi: {
    getMembers: vi.fn(),
  },
}))

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return {
    Wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  }
}

describe('useMemberListQuery', () => {
  it('retorna lista de membros quando API responde com sucesso', async () => {
    vi.mocked(memberApi.getMembers).mockResolvedValue({
      data: {
        status: 'OK',
        statusCode: 200,
        data: [{ id: 1, fullname: 'Fulano' }],
      },
    } as never)
    const { Wrapper } = createWrapper()
    const { result } = renderHook(
      () => useMemberListQuery({ page: 1, size: 10 }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toEqual([{ id: 1, fullname: 'Fulano' }])
  })
})
