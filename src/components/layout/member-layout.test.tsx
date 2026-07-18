import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { MemberLayout } from '@/components/layout/member-layout'

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-router')>(
    '@tanstack/react-router',
  )
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet" />,
    useRouterState: () => '/membro/carteirinha',
    Link: ({
      to,
      children,
      ...props
    }: {
      to: string
      children: React.ReactNode
    }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  }
})

vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: { name: 'Maria', email: 'maria@test.com' },
    signOut: vi.fn(),
  }),
}))

vi.mock('@/hooks/use-member-card-query', () => ({
  useMemberCardQuery: vi.fn(),
}))

import { useMemberCardQuery } from '@/hooks/use-member-card-query'

const mockedUseMemberCardQuery = vi.mocked(useMemberCardQuery)

describe('MemberLayout', () => {
  it('mostra links Carteirinha, Histórico e Benefícios para patrocinado', () => {
    mockedUseMemberCardQuery.mockReturnValue({
      data: {
        id: 1,
        userId: 2,
        name: 'Maria',
        document: '12345678900',
        code: 'ABC12',
        memberType: 'SPONSORED',
        accountActive: true,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    } as ReturnType<typeof useMemberCardQuery>)

    render(<MemberLayout />)

    expect(screen.getByRole('link', { name: /Carteirinha/i })).toHaveAttribute(
      'href',
      '/membro/carteirinha',
    )
    expect(screen.getByRole('link', { name: /Histórico/i })).toHaveAttribute(
      'href',
      '/membro/historico',
    )
    expect(screen.getByRole('link', { name: /Benefícios/i })).toHaveAttribute(
      'href',
      '/membro/beneficios',
    )
    expect(screen.queryByRole('link', { name: /Situação da conta/i })).not.toBeInTheDocument()
  })

  it('mostra link Situação da conta apenas para assinante', () => {
    mockedUseMemberCardQuery.mockReturnValue({
      data: {
        id: 1,
        userId: 2,
        name: 'Maria',
        document: '12345678900',
        code: 'ABC12',
        memberType: 'SUBSCRIBER',
        accountActive: true,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    } as ReturnType<typeof useMemberCardQuery>)

    render(<MemberLayout />)

    expect(screen.getByRole('link', { name: /Situação da conta/i })).toHaveAttribute(
      'href',
      '/membro/conta',
    )
  })
})
