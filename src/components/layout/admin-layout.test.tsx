import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AdminLayout } from '@/components/layout/admin-layout'

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-router')>(
    '@tanstack/react-router',
  )
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet" />,
    useRouterState: () => ({ location: { pathname: '/admin/check-ins' } }),
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
    user: { name: 'Admin', email: 'admin@test.com' },
    signOut: vi.fn(),
  }),
}))

describe('AdminLayout', () => {
  it('mostra item Check-ins no menu', () => {
    render(<AdminLayout />)

    expect(screen.getByRole('link', { name: /Check-ins/i })).toHaveAttribute(
      'href',
      '/admin/check-ins',
    )
  })
})
