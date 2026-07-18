import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ValidarContaPage } from './validar-conta-page'

const mutate = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}))

vi.mock('@/hooks/use-confirm-account-mutation', () => ({
  useConfirmAccountMutation: () => ({
    mutate,
    isPending: false,
  }),
}))

describe('ValidarContaPage', () => {
  it('envia documento sem máscara na validação', async () => {
    const user = userEvent.setup()
    mutate.mockClear()

    const client = new QueryClient()
    render(
      <QueryClientProvider client={client}>
        <ValidarContaPage token="abc-token" />
      </QueryClientProvider>,
    )

    await user.type(screen.getByLabelText(/código de validação/i), 'AB12C')
    await user.type(screen.getByLabelText(/cpf ou cnpj/i), '12345678901')
    await user.click(screen.getByRole('button', { name: /validar conta/i }))

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        token: 'abc-token',
        code: 'AB12C',
        document: '12345678901',
      }),
      expect.any(Object),
    )
  })
})
