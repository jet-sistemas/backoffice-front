import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { useMemberListQuery } from '@/hooks/use-member-list-query'

import { MemberListPage } from './member-list-page'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}))

vi.mock('@/hooks/use-member-list-query', () => ({
  useMemberListQuery: vi.fn(),
}))

describe('MemberListPage', () => {
  it('renderiza membros retornados pela query', () => {
    vi.mocked(useMemberListQuery).mockReturnValue({
      data: {
        status: 'OK',
        statusCode: 200,
        data: [
          {
            id: 1,
            fullname: 'Maria de Souza',
            email: 'maria@test.com',
            whatsapp: '11999990000',
            type: 'SUBSCRIBER',
          },
        ],
        totalElements: 1,
        totalPages: 1,
      },
      isLoading: false,
    } as ReturnType<typeof useMemberListQuery>)

    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemberListPage />
      </QueryClientProvider>,
    )

    expect(screen.getByText('Associados')).toBeInTheDocument()
    expect(screen.getByText('Maria de Souza')).toBeInTheDocument()
    expect(screen.getByText('maria@test.com')).toBeInTheDocument()
  })
})
