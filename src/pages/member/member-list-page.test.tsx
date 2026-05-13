import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { MemberListParams } from '@/types/member'

import { MemberListPage } from './member-list-page'

const { useMemberListQueryMock } = vi.hoisted(() => ({
  useMemberListQueryMock: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}))

vi.mock('@/hooks/use-member-list-query', () => ({
  useMemberListQuery: useMemberListQueryMock,
}))

const defaultListReturn = {
  data: {
    status: 'OK' as const,
    statusCode: 200,
    data: [
      {
        id: 1,
        userId: 1,
        document: '12345678901',
        code: 'ABCDE',
        fullname: 'Maria de Souza',
        email: 'maria@test.com',
        whatsapp: '11999990000',
        type: 'SUBSCRIBER' as const,
        active: true,
        createdAt: '2026-01-01T00:00:00Z',
      },
    ],
    totalElements: 1,
    totalPages: 1,
  },
  isLoading: false,
}

describe('MemberListPage', () => {
  beforeEach(() => {
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
})
