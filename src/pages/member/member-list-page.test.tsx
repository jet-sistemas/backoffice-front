import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { tableRowInactiveClassName } from '@/components/ui/table'
import type { MemberListParams, MemberListRow } from '@/types/member'

import { MemberListPage } from './member-list-page'

const { useMemberListQueryMock, deactivateMutateMock, activateMutateMock } = vi.hoisted(
  () => ({
    useMemberListQueryMock: vi.fn(),
    deactivateMutateMock: vi.fn(),
    activateMutateMock: vi.fn(),
  }),
)

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

vi.mock('@/hooks/use-member-list-query', () => ({
  useMemberListQuery: useMemberListQueryMock,
}))

vi.mock('@/hooks/use-deactivate-user-mutation', () => ({
  useDeactivateUserMutation: () => ({
    mutate: deactivateMutateMock,
    isPending: false,
  }),
}))

vi.mock('@/hooks/use-activate-user-mutation', () => ({
  useActivateUserMutation: () => ({
    mutate: activateMutateMock,
    isPending: false,
  }),
}))

function buildMember(partial: Partial<MemberListRow['member']>): MemberListRow['member'] {
  return {
    id: 1,
    userId: 1,
    document: '12345678901',
    code: 'ABCDE',
    fullname: 'Maria de Souza',
    email: 'maria@test.com',
    whatsapp: '11999990000',
    type: 'SUBSCRIBER',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    ...partial,
  }
}

function buildRow(partial: {
  userId?: number
  accountActive?: boolean
  avatarUrl?: string
  member?: Partial<MemberListRow['member']>
}): MemberListRow {
  const member = buildMember(partial.member ?? {})
  return {
    userId: partial.userId ?? member.userId,
    accountActive: partial.accountActive ?? true,
    avatarUrl: partial.avatarUrl,
    member: { ...member, userId: partial.userId ?? member.userId },
  }
}

const defaultListReturn = {
  data: {
    status: 'OK' as const,
    statusCode: 200,
    data: [buildRow({})],
    totalElements: 1,
    totalPages: 1,
  },
  isLoading: false,
  isFetching: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
}

describe('MemberListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useMemberListQueryMock.mockImplementation((_params: MemberListParams) => defaultListReturn)
  })

  it('renderiza membros retornados pela query', () => {
    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemberListPage />
      </QueryClientProvider>,
    )

    expect(screen.getByText('Associados')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Filtrar e buscar' })).toBeInTheDocument()
    expect(screen.getByText('Maria de Souza')).toBeInTheDocument()
    expect(screen.getByText('maria@test.com')).toBeInTheDocument()
    expect(screen.getByText('Ativo')).toBeInTheDocument()
  })

  it('passa isActive=true ao filtrar somente ativos', async () => {
    const user = userEvent.setup()
    let lastParams: MemberListParams | undefined
    useMemberListQueryMock.mockImplementation((params: MemberListParams) => {
      lastParams = params
      return defaultListReturn
    })

    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemberListPage />
      </QueryClientProvider>,
    )

    const comboboxes = screen.getAllByRole('combobox')
    await user.click(comboboxes[1])
    await user.click(await screen.findByRole('option', { name: 'Somente ativos' }))

    expect(lastParams?.isActive).toBe(true)
  })

  it('exibe imagem de perfil quando avatarUrl é URL absoluta', () => {
    useMemberListQueryMock.mockReturnValue({
      ...defaultListReturn,
      data: {
        ...defaultListReturn.data,
        data: [
          buildRow({
            avatarUrl: 'https://cdn.example/avatar.png',
            member: { fullname: 'Com Foto' },
          }),
        ],
      },
    })

    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemberListPage />
      </QueryClientProvider>,
    )

    const img = screen.getByRole('img', { name: 'Com Foto' })
    expect(img).toHaveAttribute('src', 'https://cdn.example/avatar.png')
  })

  it('exibe fallback acessível quando não há avatar', () => {
    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemberListPage />
      </QueryClientProvider>,
    )

    expect(screen.getByRole('img', { name: 'Sem foto de perfil' })).toBeInTheDocument()
  })

  it('mantém e-mail associado ao nome na mesma célula', () => {
    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemberListPage />
      </QueryClientProvider>,
    )

    const name = screen.getByText('Maria de Souza')
    const cell = name.closest('td')
    expect(cell).not.toBeNull()
    expect(within(cell as HTMLElement).getByText('maria@test.com')).toBeInTheDocument()
  })

  it('renderiza coluna Documento com CPF formatado', () => {
    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemberListPage />
      </QueryClientProvider>,
    )

    expect(screen.getByRole('columnheader', { name: 'Documento' })).toBeInTheDocument()
    expect(screen.getByText('123.456.789-01')).toBeInTheDocument()
  })

  it('exibe badges de tipo Assinante e Patrocinado', () => {
    useMemberListQueryMock.mockReturnValue({
      ...defaultListReturn,
      data: {
        ...defaultListReturn.data,
        data: [
          buildRow({ userId: 1, member: { type: 'SUBSCRIBER', fullname: 'A' } }),
          buildRow({
            userId: 2,
            member: {
              type: 'SPONSORED',
              fullname: 'B',
              email: 'b@test.com',
              id: 2,
              userId: 2,
            },
          }),
        ],
        totalElements: 2,
      },
    })

    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemberListPage />
      </QueryClientProvider>,
    )

    const assinante = screen.getByText('Assinante').closest('[data-slot="badge"]')
    const patrocinado = screen.getByText('Patrocinado').closest('[data-slot="badge"]')
    expect(assinante).toHaveClass('bg-jet-gold')
    expect(assinante?.className).toContain('text-amber-950')
    expect(patrocinado).toHaveClass('bg-accent')
  })

  it('usa cabeçalho Status e rótulos Ativo/Inativo conforme conta', () => {
    useMemberListQueryMock.mockReturnValue({
      ...defaultListReturn,
      data: {
        ...defaultListReturn.data,
        data: [
          buildRow({ userId: 1, accountActive: true, member: { fullname: 'Ativo' } }),
          buildRow({
            userId: 2,
            accountActive: false,
            member: {
              fullname: 'Fulano Conta Inativa',
              email: 'in@test.com',
              id: 2,
              userId: 2,
            },
          }),
        ],
        totalElements: 2,
      },
    })

    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemberListPage />
      </QueryClientProvider>,
    )

    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Situação' })).not.toBeInTheDocument()
    expect(screen.getAllByText('Ativo').length).toBeGreaterThanOrEqual(1)
    const inactiveRow = screen.getByText('Fulano Conta Inativa').closest('tr')
    expect(inactiveRow).not.toBeNull()
    expect(within(inactiveRow as HTMLElement).getByText('Inativo')).toBeInTheDocument()
  })

  it('exibe coluna Código com valor do membro', () => {
    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemberListPage />
      </QueryClientProvider>,
    )

    expect(screen.getByRole('columnheader', { name: 'Código' })).toBeInTheDocument()
    expect(screen.getByText('ABCDE')).toBeInTheDocument()
  })

  it('renderiza três ações com aria-label e link de edição', () => {
    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemberListPage />
      </QueryClientProvider>,
    )

    expect(
      screen.getByRole('link', { name: 'Editar associado Maria de Souza' }),
    ).toHaveAttribute('href', '/admin/associados/1')
    expect(
      screen.getByRole('button', { name: 'Desativar associado Maria de Souza' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Apagar associado Maria de Souza (indisponível)' }),
    ).toBeDisabled()
  })

  it('aplica estilo de linha inativa quando conta está inativa', () => {
    useMemberListQueryMock.mockReturnValue({
      ...defaultListReturn,
      data: {
        ...defaultListReturn.data,
        data: [
          buildRow({
            accountActive: false,
            member: { fullname: 'Conta Off', email: 'off@test.com' },
          }),
        ],
      },
    })

    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemberListPage />
      </QueryClientProvider>,
    )

    const row = screen.getByText('Conta Off').closest('tr')
    expect(row).not.toBeNull()
    const inactiveToken = tableRowInactiveClassName.split(' ')[0]
    expect(row?.className).toContain(inactiveToken)
  })

  it('confirma desativação chama mutate com userId', async () => {
    const user = userEvent.setup()
    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemberListPage />
      </QueryClientProvider>,
    )

    await user.click(screen.getByRole('button', { name: /Desativar associado/ }))
    await user.click(screen.getByRole('button', { name: 'Desativar' }))

    expect(deactivateMutateMock).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    )
  })
})
