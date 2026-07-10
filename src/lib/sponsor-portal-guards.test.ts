import { describe, expect, it } from 'vitest'

import { resolvePostLoginPath } from '@/lib/post-login-path'

describe('sponsor portal guards (smoke)', () => {
  it('SPONSOR entra em /patrocinador/check-in', () => {
    expect(resolvePostLoginPath('SPONSOR')).toBe('/patrocinador/check-in')
  })

  it('ADM não usa portal patrocinador', () => {
    expect(resolvePostLoginPath('ADM')).toBe('/admin/patrocinadores')
    expect(resolvePostLoginPath('ADM')).not.toMatch(/^\/patrocinador/)
  })

  it('MEMBER não usa portal patrocinador', () => {
    expect(resolvePostLoginPath('MEMBER')).toBe('/membro')
  })
})
