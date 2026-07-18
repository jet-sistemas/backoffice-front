import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SponsorCheckinPage } from './sponsor-checkin-page'

const mutate = vi.fn()

vi.mock('@/hooks/use-create-sponsor-checkin-mutation', () => ({
  useCreateSponsorCheckinMutation: () => ({
    mutate,
    isPending: false,
  }),
}))

vi.mock('@/hooks/use-sponsor-member-preview-query', () => ({
  useSponsorMemberPreviewQuery: (lookup: string | null) => {
    if (!lookup) {
      return {
        data: undefined,
        isFetching: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      }
    }
    return {
      data: {
        id: 10,
        name: 'Maria Silva',
        code: 'A1B2C',
        documentMasked: '***.456.789-**',
        memberType: 'SUBSCRIBER',
        eligible: true,
        alreadyCheckedInToday: false,
        lastCheckinAt: null,
        ineligibleReason: null,
        avatarUrl: null,
      },
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    }
  },
}))

describe('SponsorCheckinPage', () => {
  beforeEach(() => {
    mutate.mockClear()
  })

  it('busca membro por código e registra check-in', async () => {
    const user = userEvent.setup()
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={client}>
        <SponsorCheckinPage />
      </QueryClientProvider>,
    )

    await user.type(screen.getByLabelText(/código ou cpf/i), 'A1B2C')
    await user.click(screen.getByRole('button', { name: /buscar/i }))

    expect(await screen.findByText('Maria Silva')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /registrar check-in/i }))

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        lookup: 'A1B2C',
        confirmDuplicateToday: false,
      }),
      expect.any(Object),
    )
  })
})
