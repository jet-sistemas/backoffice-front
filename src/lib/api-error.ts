import { AxiosError } from 'axios'

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Não foi possível completar a operação. Tente novamente.',
): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data
    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>
      if (typeof record.message === 'string' && record.message.trim()) {
        return record.message
      }
      if (typeof record.error === 'string' && record.error.trim()) {
        return record.error
      }
      if (typeof record.detail === 'string' && record.detail.trim()) {
        return record.detail
      }
      if (Array.isArray(record.messages) && record.messages.length > 0) {
        const firstMsg = record.messages.find(
          (m): m is string => typeof m === 'string' && m.trim().length > 0,
        )
        if (firstMsg) return firstMsg
      }
      if (Array.isArray(record.errors) && record.errors.length > 0) {
        const first = record.errors[0]
        if (typeof first === 'string') return first
        if (
          first &&
          typeof first === 'object' &&
          'message' in first &&
          typeof (first as { message: string }).message === 'string'
        ) {
          return (first as { message: string }).message
        }
      }
    }
    if (!error.response && error.message === 'Network Error') {
      return 'Não foi possível conectar ao servidor.'
    }
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}
