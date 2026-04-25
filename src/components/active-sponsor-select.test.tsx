import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ActiveSponsorSelect } from './active-sponsor-select'

const mockQuery = vi.fn()

vi.mock('@/hooks/use-active-sponsor-options-paginated-query', () => ({
  useActiveSponsorOptionsPaginatedQuery: (page: number) => mockQuery(page),
}))

function renderSelect(
  props: {
    value: number | null
    onChange: (v: number | null) => void
    fallbackOption?: Parameters<
      typeof ActiveSponsorSelect
    >[0]['fallbackOption']
  },
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <ActiveSponsorSelect
        id="test-sponsor"
        value={props.value}
        onChange={props.onChange}
        fallbackOption={props.fallbackOption}
      />
    </QueryClientProvider>,
  )
}

describe('ActiveSponsorSelect', () => {
  it('chama onChange(null) ao escolher Benefício geral', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    mockQuery.mockReturnValue({
      data: {
        sponsors: [
          {
            id: 42,
            publicName: 'Patroc A',
            tier: 'BRONZE' as const,
            isActive: true,
          },
        ],
        totalPages: 1,
        totalElements: 1,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    renderSelect({
      value: 42,
      onChange,
      fallbackOption: {
        id: 42,
        publicName: 'Patroc A',
        tier: 'BRONZE',
        isActive: true,
      },
    })

    await user.click(screen.getByRole('combobox'))
    await user.click(
      screen.getByRole('option', {
        name: /Benefício geral \(sem patrocinador\)/i,
      }),
    )

    expect(onChange).toHaveBeenCalledWith(null)
  })
})
