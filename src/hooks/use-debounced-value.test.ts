import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useDebouncedValue } from './use-debounced-value'

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('atrasia atualizações pelo delay após mudança de valor', () => {
    const { result, rerender } = renderHook(
      ({ v }: { v: string }) => useDebouncedValue(v, 500),
      { initialProps: { v: '' } },
    )

    rerender({ v: 'ab' })
    expect(result.current).toBe('')

    act(() => {
      vi.advanceTimersByTime(499)
    })
    expect(result.current).toBe('')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('ab')
  })

  it('atualiza imediatamente quando o valor vira string vazia ou só espaços', () => {
    const { result, rerender } = renderHook(
      ({ v }: { v: string }) => useDebouncedValue(v, 500),
      { initialProps: { v: 'x' } },
    )

    rerender({ v: '' })
    expect(result.current).toBe('')

    rerender({ v: 'y' })
    expect(result.current).toBe('')

    rerender({ v: '   ' })
    expect(result.current).toBe('   ')
  })
})
