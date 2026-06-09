import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { useUpdateMemberAccountMutation } from '@/hooks/use-update-member-account-mutation'
import { useUpdateMemberProfileMutation } from '@/hooks/use-update-member-profile-mutation'
import { useUserWithMemberQuery } from '@/hooks/use-user-with-member-query'

import { MemberDetailPage } from './member-detail-page'

vi.mock('@/hooks/use-mark-subscriber-paid-mutation', () => ({
  useMarkSubscriberPaidMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}))

vi.mock('@/hooks/use-subscriber-payment-events-query', () => ({
  useSubscriberPaymentEventsQuery: () => ({
    data: {
      events: [],
      totalElements: 0,
      totalPages: 0,
      pageSize: 10,
      currentPage: 1,
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
  }),
}))

vi.mock('@/hooks/use-patch-subscriber-member-mutation', () => ({
  usePatchSubscriberMemberMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}))

vi.mock('@/hooks/use-update-member-account-mutation', () => ({
  useUpdateMemberAccountMutation: vi.fn(),
}))

vi.mock('@/hooks/use-update-member-profile-mutation', () => ({
  useUpdateMemberProfileMutation: vi.fn(),
}))

vi.mock('@/hooks/use-user-with-member-query', () => ({
  useUserWithMemberQuery: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}))

beforeEach(() => {
  vi.mocked(useUpdateMemberAccountMutation).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as ReturnType<typeof useUpdateMemberAccountMutation>)
  vi.mocked(useUpdateMemberProfileMutation).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as ReturnType<typeof useUpdateMemberProfileMutation>)
})

describe('MemberDetailPage', () => {
  it('exibe blocos de assinante e patrocínio quando presentes', () => {
    vi.mocked(useUserWithMemberQuery).mockReturnValue({
      data: {
        id: 10,
        email: 'a@a.com',
        name: 'Conta do Fulano',
        document: '98765432109',
        code: 'ABCDE',
        type: 'MEMBER',
        accountActive: true,
        createdAt: '2026-01-01T00:00:00Z',
        member: {
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
            grantedByUser: {
              id: 42,
              email: 'patrocinador@exemplo.com',
              name: 'Conta Patrocinador',
              type: 'SPONSOR',
            },
            startAt: '2026-01-05',
            active: true,
          },
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useUserWithMemberQuery>)

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={client}>
        <MemberDetailPage userId="10" />
      </QueryClientProvider>,
    )

    expect(screen.getByText('Editar associado')).toBeInTheDocument()
    expect(screen.getByText('Mensalidade (assinante)')).toBeInTheDocument()
    expect(screen.getByText('Histórico da mensalidade')).toBeInTheDocument()
    expect(screen.getByText('Patrocínio')).toBeInTheDocument()
    expect(screen.getByText('Conta Patrocinador')).toBeInTheDocument()
    expect(screen.getByText('patrocinador@exemplo.com')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Cancelar' })).toHaveLength(3)
  })

  it('mostra Pago neste mês quando ciclo já quitado', () => {
    vi.mocked(useUserWithMemberQuery).mockReturnValue({
      data: {
        id: 10,
        email: 'a@a.com',
        name: 'Conta do Fulano',
        document: '98765432109',
        code: 'ABCDE',
        type: 'MEMBER',
        accountActive: true,
        createdAt: '2026-01-01T00:00:00Z',
        member: {
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
            nextDueDate: '2026-06-28',
            canMarkPayment: false,
            paymentMarkBlockedReason: 'Pagamento deste ciclo já registrado.',
            paymentMarkBlockedCode: 'ALREADY_REGISTERED',
          },
          sponsored: null,
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useUserWithMemberQuery>)

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={client}>
        <MemberDetailPage userId="10" />
      </QueryClientProvider>,
    )

    expect(screen.getByRole('button', { name: /Pago neste mês/i })).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Marcar como pago' })).not.toBeInTheDocument()
  })

  it('mostra erro quando query falha', () => {
    vi.mocked(useUserWithMemberQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('falhou'),
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useUserWithMemberQuery>)

    const client = new QueryClient()
    render(
      <QueryClientProvider client={client}>
        <MemberDetailPage userId="10" />
      </QueryClientProvider>,
    )

    expect(screen.getByText('falhou')).toBeInTheDocument()
  })
})
