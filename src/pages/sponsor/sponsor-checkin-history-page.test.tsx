import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SponsorCheckinHistoryPage } from './sponsor-checkin-history-page'

const listQueryMock = vi.fn()

vi.mock('@/hooks/use-sponsor-checkin-list-query', () => ({
  useSponsorCheckinListQuery: () => listQueryMock(),
}))

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <SponsorCheckinHistoryPage />
    </QueryClientProvider>,
  )
}

describe('SponsorCheckinHistoryPage', () => {
  it('exibe badges Validado e Não validado sem coluna Duplicado', () => {
    listQueryMock.mockReturnValue({
      data: {
        data: [
          {
            id: 1,
            validated: true,
            reason: null,
            duplicateConfirmed: false,
            lookupType: 'CODE',
            createdAt: '2026-07-01T10:00:00Z',
            member: {
              id: 10,
              name: 'Maria Silva',
              code: 'A1B2C',
              documentMasked: '***.456.789-**',
            },
          },
          {
            id: 2,
            validated: false,
            reason: 'Membro inativo',
            duplicateConfirmed: false,
            lookupType: 'DOCUMENT',
            createdAt: '2026-07-02T11:00:00Z',
            member: {
              id: 11,
              name: 'João Souza',
              code: 'D4E5F',
              documentMasked: '***.123.456-**',
            },
          },
        ],
        totalElements: 2,
        totalPages: 1,
        pageSize: 10,
        currentPage: 1,
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    renderPage()

    expect(screen.getByText('Validado')).toBeInTheDocument()
    expect(screen.getByText('Não validado')).toBeInTheDocument()
    expect(screen.queryByText('Duplicado')).not.toBeInTheDocument()

    expect(screen.getByRole('heading', { name: 'Filtrar e buscar' })).toBeInTheDocument()
    expect(screen.getByLabelText('De')).toBeInTheDocument()
    expect(screen.getByLabelText('Até')).toBeInTheDocument()
  })

  it('exibe estado vazio quando não há check-ins', () => {
    listQueryMock.mockReturnValue({
      data: {
        data: [],
        totalElements: 0,
        totalPages: 0,
        pageSize: 10,
        currentPage: 1,
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    renderPage()

    expect(screen.getByText('Nenhum check-in encontrado')).toBeInTheDocument()
  })
})
