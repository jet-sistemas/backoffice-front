import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { authApi } from '@/api/auth-api'
import { TOKEN_KEY, setOnUnauthorized } from '@/lib/auth-session'
import type { UserResponse } from '@/types/auth'

interface AuthContextData {
  token: string | null
  user: UserResponse | null
  isAuthenticated: boolean
  isLoadingUser: boolean
  signIn: (token: string) => void
  signOut: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  )
  const [user, setUser] = useState<UserResponse | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(!!token)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  useEffect(() => {
    setOnUnauthorized(() => {
      queryClient.clear()
      setToken(null)
      setUser(null)
      navigate({ to: '/login', replace: true })
    })
    return () => setOnUnauthorized(null)
  }, [navigate, queryClient])

  useEffect(() => {
    if (!token) {
      setUser(null)
      setIsLoadingUser(false)
      return
    }

    setIsLoadingUser(true)
    authApi
      .getMe()
      .then((res) => {
        if (res.data.data) {
          setUser(res.data.data)
        }
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setUser(null)
      })
      .finally(() => setIsLoadingUser(false))
  }, [token])

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null)
      return
    }
    const res = await authApi.getMe()
    if (res.data.data) {
      setUser(res.data.data)
    }
  }, [token])

  const signIn = useCallback((newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    navigate({ to: '/login' })
  }, [navigate])

  const value = useMemo<AuthContextData>(
    () => ({
      token,
      user,
      isAuthenticated: !!token && !!user,
      isLoadingUser,
      signIn,
      signOut,
      refreshUser,
    }),
    [token, user, isLoadingUser, signIn, signOut, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
