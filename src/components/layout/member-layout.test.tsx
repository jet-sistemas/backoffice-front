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

describe('MemberLayout', () => {
  it('mostra links Carteirinha, Histórico e Benefícios', () => {
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
  })
})
