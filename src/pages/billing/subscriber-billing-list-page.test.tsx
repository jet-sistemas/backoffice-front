import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { SubscriberBillingListResultDTO } from '@/types/billing'

import { SubscriberBillingListPage } from './subscriber-billing-list-page'

const { listQueryMock, markPaidMutateMock } = vi.hoisted(() => ({
  listQueryMock: vi.fn(),
  markPaidMutateMock: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    params,
    ...rest
  }: {
    children: ReactNode
    to: string
    params?: { userId: string }
  }) => (
    <a
      href={params != null ? `${to.replace('$userId', params.userId)}` : to}
      {...rest}
    >
      {children}
    </a>
  ),
}))

vi.mock('@/hooks/use-subscriber-billing-list-query', () => ({
  useSubscriberBillingListQuery: listQueryMock,
}))

vi.mock('@/hooks/use-mark-subscriber-paid-mutation', () => ({
  useMarkSubscriberPaidMutation: () => ({
    mutate: markPaidMutateMock,
    isPending: false,
  }),
}))

const baseData: SubscriberBillingListResultDTO = {
  summary: {
    overdueCount: 2,
    dueSoonCount: 3,
    activeCount: 10,
    inactiveCount: 1,
  },
  rows: [
    {
      userId: 7,
      memberId: 1,
      fullname: 'Test User',
      email: 't@t.com',
      document: '12345678901',
      whatsapp: '11999990000',
      monthlyFeeAmount: 99.9,
      billingDay: 5,
      status: 'OVERDUE',
      nextDueDate: '2026-01-01',
      lastPaidAt: null,
      canMarkPayment: true,
    },
  ],
  totalElements: 1,
  totalPages: 1,
  pageSize: 10,
  currentPage: 1,
}

describe('SubscriberBillingListPage', () => {
  beforeEach(() => {
    listQueryMock.mockReturnValue({
      data: baseData,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    markPaidMutateMock.mockReset()
  })

  it('mostra resumo e linha na tabela', () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={client}>
        <SubscriberBillingListPage />
      </QueryClientProvider>,
    )

    expect(screen.getByRole('heading', { name: 'Mensalidades' })).toBeInTheDocument()
    const summaryRegion = screen.getByLabelText('Resumo por status')
    expect(within(summaryRegion).getByText('Em atraso')).toBeInTheDocument()
    expect(within(summaryRegion).getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ver/i })).toHaveAttribute(
      'href',
      '/admin/associados/7',
    )
  })

  it('abre confirmação e chama mutation ao marcar pago', async () => {
    const user = userEvent.setup()
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={client}>
        <SubscriberBillingListPage />
      </QueryClientProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Pago' }))
    expect(screen.getByRole('heading', { name: 'Registrar pagamento' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect(markPaidMutateMock).toHaveBeenCalledWith(
      { userId: 7 },
      expect.any(Object),
    )
  })

  it('mostra Pago neste mês quando pagamento do ciclo já registrado', () => {
    listQueryMock.mockReturnValue({
      data: {
        ...baseData,
        rows: [
          {
            ...baseData.rows[0],
            status: 'ACTIVE',
            nextDueDate: '2026-06-28',
            canMarkPayment: false,
            paymentMarkBlockedReason: 'Pagamento deste ciclo já registrado.',
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={client}>
        <SubscriberBillingListPage />
      </QueryClientProvider>,
    )

    expect(screen.getByRole('button', { name: /Pago neste mês/i })).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Pago' })).not.toBeInTheDocument()
  })
})
