import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AdminCheckinListPage } from './admin-checkin-list-page'

const listQueryMock = vi.fn()
const sponsorsQueryMock = vi.fn()
const membersQueryMock = vi.fn()

vi.mock('@/hooks/use-admin-checkin-list-query', () => ({
  useAdminCheckinListQuery: (params: unknown, enabled?: boolean) =>
    listQueryMock(params, enabled),
}))

vi.mock('@/hooks/use-user-list-query', () => ({
  useUserListQuery: () => sponsorsQueryMock(),
}))

vi.mock('@/hooks/use-member-list-query', () => ({
  useMemberListQuery: () => membersQueryMock(),
}))

const sampleRow = {
  id: 55,
  checkedInAt: '2026-07-06T15:12:00',
  validated: true,
  reason: null,
  duplicateConfirmed: false,
  lookupType: 'CODE',
  sponsor: {
    id: 10,
    publicName: 'Academia Jet Fit',
    tier: 'BRONZE',
    active: true,
  },
  member: {
    id: 20,
    userId: 25,
    name: 'Maria Silva',
    code: 'A1B2C',
    documentMasked: '***.456.789-**',
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

function defaultSponsorsResponse() {
  return {
    data: {
      data: [
        {
          id: 1,
          type: 'SPONSOR',
          sponsor: { id: 10, publicName: 'Academia Jet Fit', isActive: true },
        },
      ],
      totalElements: 1,
      totalPages: 1,
      pageSize: 50,
      currentPage: 1,
    },
    isLoading: false,
    isError: false,
  }
}

function defaultMembersResponse() {
  return {
    data: {
      data: [
        {
          userId: 25,
          member: { id: 20, fullname: 'Maria Silva' },
        },
      ],
      totalElements: 1,
      totalPages: 1,
      pageSize: 50,
      currentPage: 1,
    },
    isLoading: false,
    isError: false,
  }
}

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <AdminCheckinListPage />
    </QueryClientProvider>,
  )
}

describe('AdminCheckinListPage', () => {
  it('renderiza patrocinador, membro, data/hora e status', () => {
    listQueryMock.mockReturnValue(defaultListResponse())
    sponsorsQueryMock.mockReturnValue(defaultSponsorsResponse())
    membersQueryMock.mockReturnValue(defaultMembersResponse())

    renderPage()

    expect(screen.getByRole('heading', { name: 'Check-ins' })).toBeInTheDocument()
    expect(screen.getAllByText('Academia Jet Fit').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Maria Silva').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('06/07/2026')).toBeInTheDocument()
    expect(screen.getAllByText('Confirmado').length).toBeGreaterThanOrEqual(1)
  })

  it('renderiza cards mobile legíveis', () => {
    listQueryMock.mockReturnValue(defaultListResponse())
    sponsorsQueryMock.mockReturnValue(defaultSponsorsResponse())
    membersQueryMock.mockReturnValue(defaultMembersResponse())

    renderPage()

    expect(screen.getByText(/06\/07\/2026 às/)).toBeInTheDocument()
  })

  it('exibe estado vazio sem registros', () => {
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
    membersQueryMock.mockReturnValue(defaultMembersResponse())

    renderPage()

    expect(screen.getByText('Nenhum check-in registrado.')).toBeInTheDocument()
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
    membersQueryMock.mockReturnValue(defaultMembersResponse())

    renderPage()

    const user = userEvent.setup()
    await user.click(screen.getByRole('combobox', { name: 'Status' }))
    await user.click(screen.getByRole('option', { name: 'Confirmados' }))

    expect(
      screen.getByText('Nenhum check-in encontrado para os filtros selecionados.'),
    ).toBeInTheDocument()
  })

  it('filtro por status altera query e reseta página', async () => {
    listQueryMock.mockReturnValue(defaultListResponse())
    sponsorsQueryMock.mockReturnValue(defaultSponsorsResponse())
    membersQueryMock.mockReturnValue(defaultMembersResponse())

    renderPage()

    const user = userEvent.setup()
    await user.click(screen.getByRole('combobox', { name: 'Status' }))
    await user.click(screen.getByRole('option', { name: 'Não confirmados' }))

    const lastCall = listQueryMock.mock.calls.at(-1)
    expect(lastCall?.[0]).toMatchObject({ page: 1, validated: false })
  })

  it('intervalo inválido mostra erro e desabilita query', async () => {
    listQueryMock.mockReturnValue(defaultListResponse())
    sponsorsQueryMock.mockReturnValue(defaultSponsorsResponse())
    membersQueryMock.mockReturnValue(defaultMembersResponse())

    renderPage()

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('De'), '2026-07-10')
    await user.type(screen.getByLabelText('Até'), '2026-07-01')

    expect(
      screen.getByText('A data inicial não pode ser posterior à data final.'),
    ).toBeInTheDocument()

    const lastCall = listQueryMock.mock.calls.at(-1)
    expect(lastCall?.[1]).toBe(false)
  })

  it('paginação altera parâmetros da query', async () => {
    listQueryMock.mockReturnValue(
      defaultListResponse({
        data: {
          data: [sampleRow],
          totalElements: 20,
          totalPages: 2,
          pageSize: 10,
          currentPage: 1,
        },
      }),
    )
    sponsorsQueryMock.mockReturnValue(defaultSponsorsResponse())
    membersQueryMock.mockReturnValue(defaultMembersResponse())

    renderPage()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Próxima página/i }))

    const lastCall = listQueryMock.mock.calls.at(-1)
    expect(lastCall?.[0]).toMatchObject({ page: 2 })
  })
})
