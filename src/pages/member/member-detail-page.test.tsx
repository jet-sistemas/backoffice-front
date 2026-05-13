import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { useMemberQuery } from '@/hooks/use-member-query'

import { MemberDetailPage } from './member-detail-page'

vi.mock('@/hooks/use-patch-subscriber-member-mutation', () => ({
  usePatchSubscriberMemberMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}))

vi.mock('@/hooks/use-member-query', () => ({
  useMemberQuery: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}))

describe('MemberDetailPage', () => {
  it('exibe blocos de assinante e patrocínio quando presentes', () => {
    vi.mocked(useMemberQuery).mockReturnValue({
      data: {
        id: 1,
        userId: 10,
        email: 'a@a.com',
        code: 'ABCDE',
        document: '98765432109',
        fullname: 'Fulano',
        whatsapp: '11999990000',
        type: 'SUBSCRIBER',
        active: true,
        createdAt: '2026-01-01T00:00:00Z',
        subscriber: {
          id: 99,
          monthlyFeeAmount: 150.5,
          billingDay: 10,
          status: 'ACTIVE',
          nextDueDate: '2026-06-10',
        },
        sponsored: {
          memberId: 1,
          grantedByUserId: 42,
          startAt: '2026-01-05',
          active: true,
        },
      },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useMemberQuery>)

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={client}>
        <MemberDetailPage userId="10" />
      </QueryClientProvider>,
    )

    expect(screen.getByText('Mensalidade (assinante)')).toBeInTheDocument()
    expect(screen.getByText('Patrocínio')).toBeInTheDocument()
    expect(
      screen.getAllByRole('paragraph').some((p) =>
        p.textContent?.includes('Concedido por (user id):') &&
        p.textContent?.includes('42'),
      ),
    ).toBe(true)
  })

  it('mostra erro quando query falha', () => {
    vi.mocked(useMemberQuery).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: new Error('falhou'),
    } as ReturnType<typeof useMemberQuery>)

    const client = new QueryClient()
    render(
      <QueryClientProvider client={client}>
        <MemberDetailPage userId="10" />
      </QueryClientProvider>,
    )

    expect(screen.getByText('falhou')).toBeInTheDocument()
  })
})
