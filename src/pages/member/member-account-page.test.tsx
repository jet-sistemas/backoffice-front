import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MemberAccountPage } from '@/pages/member/member-account-page'
import type { MemberAccountStatusDTO } from '@/types/member-account'

const refetchAccount = vi.fn()
const refetchPayments = vi.fn()

const account: MemberAccountStatusDTO = {
  status: 'DUE_SOON',
  nextDueDate: '2026-07-25',
  monthlyFeeAmount: 50,
  billingDay: 10,
  lastPaidAt: '2026-06-10T12:00:00Z',
}

vi.mock('@/hooks/use-member-account-query', () => ({
  useMemberAccountQuery: vi.fn(),
}))

vi.mock('@/hooks/use-member-payment-history-query', () => ({
  useMemberPaymentHistoryQuery: vi.fn(),
}))

import { useMemberAccountQuery } from '@/hooks/use-member-account-query'
import { useMemberPaymentHistoryQuery } from '@/hooks/use-member-payment-history-query'

const mockedUseMemberAccountQuery = vi.mocked(useMemberAccountQuery)
const mockedUseMemberPaymentHistoryQuery = vi.mocked(useMemberPaymentHistoryQuery)

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={client}>
      <MemberAccountPage />
    </QueryClientProvider>,
  )
}

describe('MemberAccountPage', () => {
  beforeEach(() => {
    refetchAccount.mockClear()
    refetchPayments.mockClear()
    mockedUseMemberAccountQuery.mockReset()
    mockedUseMemberPaymentHistoryQuery.mockReset()

    mockedUseMemberPaymentHistoryQuery.mockReturnValue({
      data: {
        payments: [
          {
            id: 1,
            conferenceAt: '2026-06-10T15:30:00Z',
            adminName: 'Admin Teste',
            amount: 50,
            note: 'Conferido',
          },
        ],
        totalElements: 1,
        totalPages: 1,
        pageSize: 10,
        currentPage: 1,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: refetchPayments,
      isFetching: false,
    } as ReturnType<typeof useMemberPaymentHistoryQuery>)
  })

  it('exibe loading inicial', () => {
    mockedUseMemberAccountQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: refetchAccount,
      isFetching: false,
    } as ReturnType<typeof useMemberAccountQuery>)

    renderPage()

    expect(screen.getByLabelText('Carregando situação da conta')).toBeInTheDocument()
  })

  it('exibe erro e permite tentar novamente', async () => {
    mockedUseMemberAccountQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Falha ao carregar'),
      refetch: refetchAccount,
      isFetching: false,
    } as ReturnType<typeof useMemberAccountQuery>)

    const user = userEvent.setup()
    renderPage()

    expect(screen.getByText('Não foi possível carregar a situação da conta')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /tentar novamente/i }))
    expect(refetchAccount).toHaveBeenCalled()
  })

  it('renderiza badge de status e histórico de pagamentos', () => {
    mockedUseMemberAccountQuery.mockReturnValue({
      data: account,
      isLoading: false,
      isError: false,
      error: null,
      refetch: refetchAccount,
      isFetching: false,
    } as ReturnType<typeof useMemberAccountQuery>)

    renderPage()

    expect(screen.getByText('Situação da conta')).toBeInTheDocument()
    expect(screen.getByText('A vencer')).toBeInTheDocument()
    expect(screen.getByText('Admin Teste')).toBeInTheDocument()
    expect(screen.getByText('Conferido')).toBeInTheDocument()
  })

  it('exibe mensagem quando histórico está vazio', () => {
    mockedUseMemberAccountQuery.mockReturnValue({
      data: account,
      isLoading: false,
      isError: false,
      error: null,
      refetch: refetchAccount,
      isFetching: false,
    } as ReturnType<typeof useMemberAccountQuery>)

    mockedUseMemberPaymentHistoryQuery.mockReturnValue({
      data: {
        payments: [],
        totalElements: 0,
        totalPages: 0,
        pageSize: 10,
        currentPage: 1,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: refetchPayments,
      isFetching: false,
    } as ReturnType<typeof useMemberPaymentHistoryQuery>)

    renderPage()

    expect(screen.getByText('Nenhum pagamento registrado ainda.')).toBeInTheDocument()
  })
})
