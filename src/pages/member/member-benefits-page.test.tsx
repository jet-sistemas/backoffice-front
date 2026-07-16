import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { MemberBenefitsPage } from './member-benefits-page'

const listQueryMock = vi.fn()

vi.mock('@/hooks/use-member-benefit-list-query', () => ({
  useMemberBenefitListQuery: (params: unknown) => listQueryMock(params),
}))

const generalBenefit = {
  id: 13,
  name: 'Evento exclusivo',
  description: 'Entrada gratuita para membros.',
  address: null,
  sponsor: null,
}

const sponsoredBenefit = {
  id: 12,
  name: 'Desconto na mensalidade',
  description: '10% de desconto para membros Jet.',
  address: 'Rua Exemplo, 123',
  sponsor: {
    id: 10,
    publicName: 'Academia Jet Fit',
    tier: 'BRONZE',
    logoUrl: 'sponsors/logo/10/logo.png',
  },
}

function defaultListResponse(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      data: [sponsoredBenefit, generalBenefit],
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
    ...overrides,
  }
}

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <MemberBenefitsPage />
    </QueryClientProvider>,
  )
}

describe('MemberBenefitsPage', () => {
  it('renderiza benefícios gerais e com patrocinador', () => {
    listQueryMock.mockReturnValue(defaultListResponse())

    renderPage()

    expect(screen.getByRole('heading', { name: 'Benefícios' })).toBeInTheDocument()
    expect(screen.getByText('Evento exclusivo')).toBeInTheDocument()
    expect(screen.getByText('Desconto na mensalidade')).toBeInTheDocument()
    expect(screen.getByText('Benefício da associação')).toBeInTheDocument()
    expect(screen.getByText('Academia Jet Fit')).toBeInTheDocument()
  })

  it('renderiza logo do patrocinador quando disponível', () => {
    listQueryMock.mockReturnValue(defaultListResponse())

    const { container } = renderPage()

    const img = container.querySelector('img[src*="sponsors/logo/10/logo.png"]')
    expect(img).not.toBeNull()
  })

  it('exibe estado vazio sem benefícios ativos', () => {
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

    renderPage()

    expect(screen.getByText('Nenhum benefício ativo disponível.')).toBeInTheDocument()
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

    renderPage()

    expect(screen.getByText('Erro ao carregar benefícios')).toBeInTheDocument()
    expect(screen.getByText('Falha na rede')).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Tentar novamente/i }))
    expect(refetch).toHaveBeenCalled()
  })

  it('paginação altera params da query', async () => {
    listQueryMock.mockReturnValue(
      defaultListResponse({
        data: {
          data: [generalBenefit],
          totalElements: 15,
          totalPages: 2,
          pageSize: 10,
          currentPage: 1,
        },
      }),
    )

    renderPage()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Próxima página/i }))

    const lastCall = listQueryMock.mock.calls.at(-1)
    expect(lastCall?.[0]).toMatchObject({ page: 2, size: 10 })
  })

  it('não exibe botões de CRUD', () => {
    listQueryMock.mockReturnValue(defaultListResponse())

    renderPage()

    expect(screen.queryByRole('button', { name: /Criar/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Editar/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Excluir/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Desativar/i })).not.toBeInTheDocument()
  })
})
