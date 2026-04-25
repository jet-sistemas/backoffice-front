import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useBenefitListQuery } from '@/hooks/use-benefit-list-query'

import { BenefitListPage } from './benefit-list-page'

const { activateMutate } = vi.hoisted(() => ({
  activateMutate: vi.fn(),
}))

vi.mock('@/hooks/use-benefit-list-query', () => ({
  useBenefitListQuery: vi.fn(),
}))

vi.mock('@/hooks/use-create-benefit-mutation', () => ({
  useCreateBenefitMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
  }),
}))

vi.mock('@/hooks/use-update-benefit-mutation', () => ({
  useUpdateBenefitMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
  }),
}))

vi.mock('@/hooks/use-deactivate-benefit-mutation', () => ({
  useDeactivateBenefitMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
  }),
}))

vi.mock('@/hooks/use-activate-benefit-mutation', () => ({
  useActivateBenefitMutation: () => ({
    mutate: activateMutate,
    isPending: false,
    isError: false,
  }),
}))

vi.mock('@/components/active-sponsor-select', () => ({
  ActiveSponsorSelect: () => (
    <div data-testid="active-sponsor-select-stub" />
  ),
}))

function renderPage() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return render(
    <QueryClientProvider client={client}>
      <BenefitListPage />
    </QueryClientProvider>
  )
}

describe('BenefitListPage table (inactive rows vs sponsor list)', () => {
  beforeEach(() => {
    vi.mocked(useBenefitListQuery).mockReturnValue({
      data: {
        status: 'OK',
        statusCode: 200,
        data: [
          {
            id: 1,
            name: 'Benefício inativo com patrocinador',
            description: 'Descrição',
            address: 'Endereço',
            isActive: false,
            sponsor: {
              id: 10,
              publicName: 'Patroc Bronze',
              tier: 'BRONZE',
              isActive: true,
            },
          },
          {
            id: 2,
            name: 'Benefício ativo sem patrocinador',
            description: 'X',
            isActive: true,
            sponsor: undefined,
          },
        ],
        totalElements: 2,
        totalPages: 1,
      },
      isLoading: false,
      isPending: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as ReturnType<typeof useBenefitListQuery>)
  })

  it('aplica font-thin no nome quando inativo, sem font-semibold; ativo mantém font-medium sem font-thin', () => {
    renderPage()

    const inactiveName = screen.getByText('Benefício inativo com patrocinador')
    const inactiveCell = inactiveName.closest('td')
    expect(inactiveCell).toBeTruthy()
    expect(inactiveCell).toHaveClass('font-thin', 'text-neutral-600')
    expect(inactiveCell).not.toHaveClass('font-semibold')

    const activeName = screen.getByText('Benefício ativo sem patrocinador')
    const activeCell = activeName.closest('td')
    expect(activeCell).toHaveClass('font-medium')
    expect(activeCell).not.toHaveClass('font-thin')
  })

  it('exibe Inativo na célula de estado sem bolinha decorativa (span size-1.5)', () => {
    renderPage()

    const row = screen
      .getByText('Benefício inativo com patrocinador')
      .closest('tr')
    expect(row).toBeTruthy()
    expect(within(row as HTMLElement).getByText('Inativo')).toBeInTheDocument()

    const dot = (row as HTMLElement).querySelector(
      'span.size-1\\.5.shrink-0.rounded-full.bg-neutral-400'
    )
    expect(dot).toBeNull()
  })

  it('neutraliza o badge de tier quando o benefício está inativo', () => {
    renderPage()

    const row = screen
      .getByText('Benefício inativo com patrocinador')
      .closest('tr')
    expect(row).toBeTruthy()

    const tierBadge = within(row as HTMLElement)
      .getByText('Bronze')
      .closest('[data-slot="badge"]')
    expect(tierBadge).toBeTruthy()
    expect(tierBadge).toHaveClass(
      'bg-neutral-200',
      'text-neutral-500',
      'opacity-90'
    )
  })
})

describe('BenefitListPage reativar (botão toggle)', () => {
  const baseEnvelope = {
    status: 'OK' as const,
    statusCode: 200,
    totalElements: 1,
    totalPages: 1,
  }

  it('habilita reativar para benefício geral inativo e confirma a mutação', async () => {
    const user = userEvent.setup()
    activateMutate.mockClear()

    vi.mocked(useBenefitListQuery).mockReturnValue({
      data: {
        ...baseEnvelope,
        data: [
          {
            id: 7,
            name: 'Geral inativo',
            description: 'd',
            isActive: false,
            sponsor: undefined,
          },
        ],
      },
      isLoading: false,
      isPending: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as ReturnType<typeof useBenefitListQuery>)

    renderPage()

    const reativar = screen.getByRole('button', {
      name: /Reativar benefício Geral inativo/,
    })
    expect(reativar).not.toBeDisabled()
    await user.click(reativar)
    expect(screen.getByText('Reativar benefício?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reativar' }))
    expect(activateMutate).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ onSuccess: expect.any(Function) })
    )
  })

  it('desabilita reativar quando o patrocinador está inativo', () => {
    vi.mocked(useBenefitListQuery).mockReturnValue({
      data: {
        ...baseEnvelope,
        data: [
          {
            id: 8,
            name: 'Vinculado patr inativo',
            description: 'd',
            isActive: false,
            sponsor: {
              id: 1,
              publicName: 'Patroc desligado',
              tier: 'BRONZE' as const,
              isActive: false,
            },
          },
        ],
      },
      isLoading: false,
      isPending: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as ReturnType<typeof useBenefitListQuery>)

    renderPage()

    const bloqueado = screen.getByRole('button', {
      name: /Não é possível reativar Vinculado patr inativo/,
    })
    expect(bloqueado).toBeDisabled()
  })

  it('habilita reativar para benefício inativo com patrocinador ativo', () => {
    vi.mocked(useBenefitListQuery).mockReturnValue({
      data: {
        ...baseEnvelope,
        data: [
          {
            id: 9,
            name: 'Inativo com patr ativo',
            description: 'd',
            isActive: false,
            sponsor: {
              id: 2,
              publicName: 'Patroc ok',
              tier: 'OURO' as const,
              isActive: true,
            },
          },
        ],
      },
      isLoading: false,
      isPending: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as ReturnType<typeof useBenefitListQuery>)

    renderPage()

    const btn = screen.getByRole('button', {
      name: /Reativar benefício Inativo com patr ativo/,
    })
    expect(btn).not.toBeDisabled()
  })
})
