import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { MemberCreatePage } from './member-create-page'

const mutate = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to: _to }: { children: ReactNode; to: string }) => (
    <span>{children}</span>
  ),
}))

vi.mock('@/hooks/use-create-member-mutation', () => ({
  useCreateMemberMutation: () => ({
    mutate,
    isPending: false,
  }),
}))

describe('MemberCreatePage', () => {
  it('envia bloco subscriber ao criar assinante', async () => {
    const user = userEvent.setup()
    mutate.mockClear()

    const client = new QueryClient()
    render(
      <QueryClientProvider client={client}>
        <MemberCreatePage />
      </QueryClientProvider>,
    )

    await user.type(screen.getByLabelText(/e-mail/i), 'novo@test.com')
    await user.type(screen.getByLabelText(/nome da conta/i), 'Conta')
    await user.type(screen.getByLabelText(/nome completo/i), 'Nome Completo')
    await user.type(screen.getByLabelText(/^documento/i), '12345678901')
    await user.type(screen.getByLabelText(/código/i), 'ABCDE')
    await user.type(screen.getByLabelText(/whatsapp/i), '11988887777')
    await user.type(screen.getByLabelText(/valor da mensalidade/i), '99.9')
    await user.type(screen.getByLabelText(/^dia de cobrança/i), '15')

    await user.click(screen.getByRole('button', { name: /criar associado/i }))

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        member: expect.objectContaining({
          type: 'SUBSCRIBER',
          subscriber: { monthlyFeeAmount: 99.9, billingDay: 15 },
        }),
      }),
    )
  })
})
