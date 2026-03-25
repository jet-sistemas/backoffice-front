import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from '@tanstack/react-router'
import { authApi } from '@/api/auth-api'
import type { UserResponse } from '@/types/auth'

const TOKEN_KEY = '@jet:token'

interface AuthContextData {
  token: string | null
  user: UserResponse | null
  isAuthenticated: boolean
  isLoadingUser: boolean
  signIn: (token: string) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  )
  const [user, setUser] = useState<UserResponse | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(!!token)
  const navigate = useNavigate()

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
    }),
    [token, user, isLoadingUser, signIn, signOut],
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
