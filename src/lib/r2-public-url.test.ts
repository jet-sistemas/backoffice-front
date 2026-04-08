import { afterEach, describe, expect, it, vi } from 'vitest'

import { resolveR2PublicUrl } from '@/lib/r2-public-url'

describe('resolveR2PublicUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns undefined for empty input', () => {
    expect(resolveR2PublicUrl(undefined)).toBeUndefined()
    expect(resolveR2PublicUrl(null)).toBeUndefined()
    expect(resolveR2PublicUrl('')).toBeUndefined()
    expect(resolveR2PublicUrl('   ')).toBeUndefined()
  })

  it('returns http(s) URLs unchanged', () => {
    expect(resolveR2PublicUrl('https://cdn.example.com/a.png')).toBe(
      'https://cdn.example.com/a.png',
    )
    expect(resolveR2PublicUrl('http://local.test/x')).toBe('http://local.test/x')
  })

  it('joins VITE_R2_PUBLIC_BASE_URL with relative key', () => {
    vi.stubEnv('VITE_R2_PUBLIC_BASE_URL', 'https://pub.test.dev')
    expect(resolveR2PublicUrl('dev/sponsors/logo/a.png')).toBe(
      'https://pub.test.dev/dev/sponsors/logo/a.png',
    )
  })

  it('trims slashes between base and key', () => {
    vi.stubEnv('VITE_R2_PUBLIC_BASE_URL', 'https://pub.test.dev/')
    expect(resolveR2PublicUrl('/dev/x.png')).toBe('https://pub.test.dev/dev/x.png')
  })

  it('returns key only when base is unset', () => {
    vi.stubEnv('VITE_R2_PUBLIC_BASE_URL', '')
    expect(resolveR2PublicUrl('dev/x.png')).toBe('dev/x.png')
  })
})
