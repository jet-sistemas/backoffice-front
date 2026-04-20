import axios, { type InternalAxiosRequestConfig } from 'axios'
import { TOKEN_KEY, notifySessionExpired } from '@/lib/auth-session'

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKOFFICE_API_URL,
})

function isAuthLoginRequest(config: InternalAxiosRequestConfig | undefined) {
  if (!config?.method || config.method.toLowerCase() !== 'post') {
    return false
  }
  const rel = config.url ?? ''
  const base = config.baseURL ?? ''
  try {
    const path = new URL(rel, base || 'http://localhost').pathname.replace(
      /\/$/,
      '',
    )
    return path === '/v1/auth'
  } catch {
    const path = rel.split('?')[0].replace(/\/$/, '')
    return path === '/v1/auth' || path.endsWith('/v1/auth')
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !isAuthLoginRequest(error.config)
    ) {
      notifySessionExpired()
    }
    return Promise.reject(error)
  },
)
