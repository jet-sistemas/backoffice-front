import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { userApi } from '@/api/user-api'

import { useActivateUserMutation } from './use-activate-user-mutation'
import { useDeactivateUserMutation } from './use-deactivate-user-mutation'

vi.mock('@/api/user-api', () => ({
  userApi: {
    activateUser: vi.fn().mockResolvedValue({ data: {} }),
    deactivateUser: vi.fn().mockResolvedValue({ data: {} }),
  },
}))

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return {
    client,
    Wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  }
}

function expectInvalidatesBenefitsSponsorOptions(
  spy: ReturnType<typeof vi.spyOn<QueryClient, 'invalidateQueries'>>,
) {
  const keys = spy.mock.calls.map(
    (c) => (c[0] as { queryKey: unknown[] }).queryKey,
  )
  expect(keys).toEqual(
    expect.arrayContaining([['users'], ['user', 7], ['benefits']]),
  )
  expect(
    keys.some((k) => Array.isArray(k) && k[0] === 'sponsor-options'),
  ).toBe(true)
}

describe('useActivateUserMutation / useDeactivateUserMutation', () => {
  it('após ativar, invalida users, user, benefícios e opções de patrocinador', async () => {
    const { client, Wrapper } = createWrapper()
    const spy = vi.spyOn(client, 'invalidateQueries')
    const { result } = renderHook(() => useActivateUserMutation(), {
      wrapper: Wrapper,
    })
    result.current.mutate(7)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(userApi.activateUser)).toHaveBeenCalledWith(7)
    expect(spy).toHaveBeenCalledWith({ queryKey: ['users'] })
    expect(spy).toHaveBeenCalledWith({ queryKey: ['user', 7] })
    expectInvalidatesBenefitsSponsorOptions(spy)
  })

  it('após desativar, invalida users, user, benefícios e opções de patrocinador', async () => {
    const { client, Wrapper } = createWrapper()
    const spy = vi.spyOn(client, 'invalidateQueries')
    const { result } = renderHook(() => useDeactivateUserMutation(), {
      wrapper: Wrapper,
    })
    result.current.mutate(7)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(userApi.deactivateUser)).toHaveBeenCalledWith(7)
    expect(spy).toHaveBeenCalledWith({ queryKey: ['users'] })
    expect(spy).toHaveBeenCalledWith({ queryKey: ['user', 7] })
    expectInvalidatesBenefitsSponsorOptions(spy)
  })
})
