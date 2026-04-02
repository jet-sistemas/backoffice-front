export const TOKEN_KEY = '@jet:token'

type OnUnauthorized = () => void

let onUnauthorized: OnUnauthorized | null = null

export function setOnUnauthorized(handler: OnUnauthorized | null) {
  onUnauthorized = handler
}

export function notifySessionExpired() {
  localStorage.removeItem(TOKEN_KEY)
  onUnauthorized?.()
}
