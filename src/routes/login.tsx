import { createFileRoute, isRedirect, redirect } from '@tanstack/react-router'
import { authApi } from '@/api/auth-api'
import { TOKEN_KEY } from '@/lib/auth-session'
import { resolvePostAuthPath } from '@/lib/post-login-path'
import { LoginPage } from '@/pages/login-page'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      return
    }

    try {
      const me = await authApi.getMe()
      throw redirect({ to: resolvePostAuthPath(me.data.data), replace: true })
    } catch (error) {
      if (isRedirect(error)) {
        throw error
      }
      localStorage.removeItem(TOKEN_KEY)
    }
  },
  component: LoginPage,
})
