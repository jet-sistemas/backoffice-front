import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { MemberCheckinHistoryPage } from './member-checkin-history-page'

const listQueryMock = vi.fn()
const sponsorsQueryMock = vi.fn()

vi.mock('@/hooks/use-member-checkin-list-query', () => ({
  useMemberCheckinListQuery: (params: unknown, enabled?: boolean) =>
    listQueryMock(params, enabled),
}))

vi.mock('@/hooks/use-member-checkin-sponsor-options-query', () => ({
  useMemberCheckinSponsorOptionsQuery: () => sponsorsQueryMock(),
}))

const sampleRow = {
  id: 55,
  checkedInAt: '2026-07-06T15:12:00',
  validated: true,
  duplicateConfirmed: false,
  sponsor: {
    id: 10,
    publicName: 'Academia Jet Fit',
    logoUrl: 'sponsors/logo/10/logo.png',
    tier: 'BRONZE',
    active: true,
  },
}

function defaultListResponse(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      data: [sampleRow],
      totalElements: 1,
      totalPages: 1,
      pageSize: 10,
      currentPage: 1,
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  }
}

function defaultSponsorsResponse(overrides: Record<string, unknown> = {}) {
  return {
    data: [
      { id: 10, publicName: 'Academia Jet Fit', logoUrl: null, active: true },
      { id: 20, publicName: 'Studio Fit', logoUrl: null, active: false },
    ],
    isLoading: false,
    isError: false,
    ...overrides,
  }
}

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <MemberCheckinHistoryPage />
    </QueryClientProvider>,
  )
}

describe('MemberCheckinHistoryPage', () => {
  it('renderiza patrocinador, data, hora e status na tabela desktop', () => {
    listQueryMock.mockReturnValue(defaultListResponse())
    sponsorsQueryMock.mockReturnValue(defaultSponsorsResponse())

    renderPage()

    expect(screen.getByRole('heading', { name: 'Histórico de Check-ins' })).toBeInTheDocument()
    expect(screen.getAllByText('Academia Jet Fit').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('06/07/2026')).toBeInTheDocument()
    expect(screen.getAllByText('Check-in confirmado').length).toBeGreaterThanOrEqual(1)
  })

  it('renderiza cards mobile legíveis', () => {
    listQueryMock.mockReturnValue(defaultListResponse())
    sponsorsQueryMock.mockReturnValue(defaultSponsorsResponse())

    renderPage()

    expect(screen.getByText(/06\/07\/2026 às/)).toBeInTheDocument()
  })

  it('exibe estado vazio sem check-ins', () => {
    listQueryMock.mockReturnValue(
      defaultListResponse({
        data: {
          data: [],
          totalElements: 0,
          totalPages: 0,
          pageSize: 10,
          currentPage: 1,
        },
      }),
    )
    sponsorsQueryMock.mockReturnValue(defaultSponsorsResponse({ data: [] }))

    renderPage()

    expect(screen.getByText('Nenhum check-in encontrado.')).toBeInTheDocument()
  })

  it('exibe estado vazio com filtros sem resultado', async () => {
    listQueryMock.mockReturnValue(
      defaultListResponse({
        data: {
          data: [],
          totalElements: 0,
          totalPages: 0,
          pageSize: 10,
          currentPage: 1,
        },
      }),
    )
    sponsorsQueryMock.mockReturnValue(defaultSponsorsResponse())

    renderPage()

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('De'), '2026-07-01')

    expect(
      screen.getByText('Nenhum check-in encontrado para os filtros selecionados.'),
    ).toBeInTheDocument()
  })

  it('intervalo inválido mostra erro e desabilita fetch', async () => {
    listQueryMock.mockReturnValue(defaultListResponse())
    sponsorsQueryMock.mockReturnValue(defaultSponsorsResponse())

    renderPage()

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('De'), '2026-07-31')
    await user.type(screen.getByLabelText('Até'), '2026-07-01')

    expect(
      screen.getByText('A data inicial não pode ser posterior à data final.'),
    ).toBeInTheDocument()

    const lastCall = listQueryMock.mock.calls.at(-1)
    expect(lastCall?.[1]).toBe(false)
  })

  it('filtro por patrocinador altera params e reseta página', async () => {
    listQueryMock.mockReturnValue(defaultListResponse())
    sponsorsQueryMock.mockReturnValue(defaultSponsorsResponse())

    renderPage()

    const user = userEvent.setup()
    await user.click(screen.getByLabelText('Patrocinador'))
    await user.click(screen.getByRole('option', { name: 'Studio Fit' }))

    const lastCall = listQueryMock.mock.calls.at(-1)
    expect(lastCall?.[0]).toMatchObject({ sponsorId: 20, page: 1 })
  })

  it('filtro por data altera params', async () => {
    listQueryMock.mockReturnValue(defaultListResponse())
    sponsorsQueryMock.mockReturnValue(defaultSponsorsResponse())

    renderPage()

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('De'), '2026-07-01')

    const lastCall = listQueryMock.mock.calls.at(-1)
    expect(lastCall?.[0]).toMatchObject({ startDate: '2026-07-01', page: 1 })
  })

  it('limpar filtros zera sponsor e datas', async () => {
    listQueryMock.mockReturnValue(defaultListResponse())
    sponsorsQueryMock.mockReturnValue(defaultSponsorsResponse())

    renderPage()

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('De'), '2026-07-01')
    await user.click(screen.getByRole('button', { name: /Limpar tudo/i }))

    expect(screen.getByLabelText('De')).toHaveValue('')
    expect(screen.getByLabelText('Até')).toHaveValue('')
  })

  it('exibe erro e permite refetch', async () => {
    const refetch = vi.fn()
    listQueryMock.mockReturnValue(
      defaultListResponse({
        data: undefined,
        isError: true,
        error: new Error('Falha na rede'),
        refetch,
      }),
    )
    sponsorsQueryMock.mockReturnValue(defaultSponsorsResponse())

    renderPage()

    expect(screen.getByText('Erro ao carregar histórico')).toBeInTheDocument()
    expect(screen.getByText('Falha na rede')).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Tentar novamente/i }))
    expect(refetch).toHaveBeenCalled()
  })

  it('select de patrocinador fica desabilitado quando não há opções', () => {
    listQueryMock.mockReturnValue(defaultListResponse())
    sponsorsQueryMock.mockReturnValue(defaultSponsorsResponse({ data: [] }))

    renderPage()

    expect(screen.getByLabelText('Patrocinador')).toBeDisabled()
  })

  it('paginação altera página', async () => {
    listQueryMock.mockReturnValue(
      defaultListResponse({
        data: {
          data: [sampleRow],
          totalElements: 25,
          totalPages: 3,
          pageSize: 10,
          currentPage: 1,
        },
      }),
    )
    sponsorsQueryMock.mockReturnValue(defaultSponsorsResponse())

    renderPage()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Próxima página/i }))

    const lastCall = listQueryMock.mock.calls.at(-1)
    expect(lastCall?.[0]).toMatchObject({ page: 2 })
  })
})
