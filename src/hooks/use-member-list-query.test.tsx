import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { userApi } from '@/api/user-api'

import { useMemberListQuery } from './use-member-list-query'

vi.mock('@/api/user-api', () => ({
  userApi: {
    getUsers: vi.fn(),
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
  it('inclui isActive nos params ao ser informado', async () => {
    vi.mocked(userApi.getUsers).mockResolvedValue({
      data: {
        status: 'OK',
        statusCode: 200,
        data: [],
        totalElements: 0,
        totalPages: 0,
      },
    } as never)
    const { Wrapper } = createWrapper()
    const { result } = renderHook(
      () =>
        useMemberListQuery({
          page: 1,
          size: 10,
          isActive: false,
        }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(userApi.getUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'MEMBER',
        isActive: false,
      }),
    )
  })

  it('propaga mensagem quando API falha', async () => {
    vi.mocked(userApi.getUsers).mockRejectedValue(new Error('network'))
    const { Wrapper } = createWrapper()
    const { result } = renderHook(
      () => useMemberListQuery({ page: 1, size: 10 }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toMatch(/network/i)
  })
})
