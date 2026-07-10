import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MemberCard } from '@/components/member-card'
import type { MemberCardDTO } from '@/types/member-card'

const baseCard: MemberCardDTO = {
  id: 10,
  userId: 25,
  name: 'Maria Silva',
  document: '12345678900',
  code: 'A1B2C',
  avatarUrl: null,
  memberType: 'SUBSCRIBER',
  accountActive: true,
}

describe('MemberCard', () => {
  it('renderiza nome, CPF formatado e código', () => {
    render(<MemberCard card={baseCard} />)

    expect(screen.getByText('Maria Silva')).toBeInTheDocument()
    expect(screen.getByText('123.456.789-00')).toBeInTheDocument()
    expect(screen.getByText('A1B2C')).toBeInTheDocument()
    expect(screen.getByText('Carteirinha de Membro')).toBeInTheDocument()
  })

  it('renderiza fallback com iniciais em tom azul claro quando não há foto', () => {
    render(<MemberCard card={baseCard} />)

    const fallback = screen.getByLabelText('Iniciais de Maria Silva')
    expect(fallback).toHaveTextContent('MS')
    expect(fallback).toHaveClass('bg-blue-50', 'text-blue-400')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renderiza foto quando avatarUrl existe', () => {
    render(
      <MemberCard
        card={{
          ...baseCard,
          avatarUrl: 'users/avatar/25/avatar.png',
        }}
      />,
    )

    const img = screen.getByRole('img', { name: 'Foto de Maria Silva' })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', expect.stringContaining('users/avatar/25/avatar.png'))
  })

  it('exibe rótulo do tipo de membro e código em destaque', () => {
    render(<MemberCard card={baseCard} />)

    expect(screen.getByText('Assinante')).toBeInTheDocument()
    expect(screen.getByText('A1B2C')).toHaveClass('gradient-membership-text')
  })

  it('exibe rótulo "Patrocinado" para membros SPONSORED', () => {
    render(<MemberCard card={{ ...baseCard, memberType: 'SPONSORED' }} />)

    expect(screen.getByText('Patrocinado')).toBeInTheDocument()
  })
})
