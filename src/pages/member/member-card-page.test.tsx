import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MemberCardPage } from '@/pages/member/member-card-page'
import type { MemberCardDTO } from '@/types/member-card'

const refetch = vi.fn()

const card: MemberCardDTO = {
  id: 10,
  userId: 25,
  name: 'Maria Silva',
  document: '12345678900',
  code: 'A1B2C',
  avatarUrl: null,
  memberType: 'SUBSCRIBER',
  accountActive: true,
}

vi.mock('@/hooks/use-member-card-query', () => ({
  useMemberCardQuery: vi.fn(),
}))

import { useMemberCardQuery } from '@/hooks/use-member-card-query'

const mockedUseMemberCardQuery = vi.mocked(useMemberCardQuery)

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={client}>
      <MemberCardPage />
    </QueryClientProvider>,
  )
}

describe('MemberCardPage', () => {
  beforeEach(() => {
    refetch.mockClear()
    mockedUseMemberCardQuery.mockReset()
  })

  it('exibe loading inicial', () => {
    mockedUseMemberCardQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch,
      isFetching: false,
    } as ReturnType<typeof useMemberCardQuery>)

    renderPage()

    expect(screen.getByLabelText('Carregando carteirinha')).toBeInTheDocument()
  })

  it('exibe erro e permite tentar novamente', async () => {
    mockedUseMemberCardQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Falha ao carregar'),
      refetch,
      isFetching: false,
    } as ReturnType<typeof useMemberCardQuery>)

    const user = userEvent.setup()
    renderPage()

    expect(screen.getByText('Não foi possível carregar a carteirinha')).toBeInTheDocument()
    expect(screen.getByText('Falha ao carregar')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /tentar novamente/i }))
    expect(refetch).toHaveBeenCalled()
  })

  it('renderiza carteirinha com dados do membro', () => {
    mockedUseMemberCardQuery.mockReturnValue({
      data: card,
      isLoading: false,
      isError: false,
      error: null,
      refetch,
      isFetching: false,
    } as ReturnType<typeof useMemberCardQuery>)

    renderPage()

    expect(screen.getByText('Minha carteirinha')).toBeInTheDocument()
    expect(screen.getByText('Maria Silva')).toBeInTheDocument()
    expect(screen.getByText('123.456.789-00')).toBeInTheDocument()
    expect(screen.getByText('A1B2C')).toBeInTheDocument()
  })
})
