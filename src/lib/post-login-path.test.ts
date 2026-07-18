import { describe, expect, it } from 'vitest'

import { resolvePostAuthPath, resolvePostLoginPath } from '@/lib/post-login-path'

describe('resolvePostLoginPath', () => {
  it('routes ADM to the admin panel', () => {
    expect(resolvePostLoginPath('ADM')).toBe('/admin/patrocinadores')
  })

  it('routes MEMBER to the member portal', () => {
    expect(resolvePostLoginPath('MEMBER')).toBe('/membro/carteirinha')
  })

  it('routes SPONSOR and SPONSOR_MEMBER to the sponsor portal', () => {
    expect(resolvePostLoginPath('SPONSOR')).toBe('/patrocinador/check-in')
    expect(resolvePostLoginPath('SPONSOR_MEMBER')).toBe('/patrocinador/check-in')
  })

  it('falls back to login for unknown/undefined types', () => {
    expect(resolvePostLoginPath(undefined)).toBe('/login')
  })
})

describe('resolvePostAuthPath', () => {
  it('returns login when there is no user', () => {
    expect(resolvePostAuthPath(null)).toBe('/login')
    expect(resolvePostAuthPath(undefined)).toBe('/login')
  })

  it('sends users with pending password change to the change password page', () => {
    expect(
      resolvePostAuthPath({ type: 'ADM', mustChangePassword: true }),
    ).toBe('/alterar-senha-obrigatoria')
    expect(
      resolvePostAuthPath({ type: 'MEMBER', mustChangePassword: true }),
    ).toBe('/alterar-senha-obrigatoria')
  })

  it('delegates to resolvePostLoginPath when password change is not pending', () => {
    expect(
      resolvePostAuthPath({ type: 'SPONSOR', mustChangePassword: false }),
    ).toBe('/patrocinador/check-in')
  })
})
