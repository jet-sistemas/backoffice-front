import { createFileRoute, isRedirect, redirect } from '@tanstack/react-router'
import { authApi } from '@/api/auth-api'
import { TOKEN_KEY } from '@/lib/auth-session'
import { resolvePostAuthPath } from '@/lib/post-login-path'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      throw redirect({ to: '/login' })
    }

    try {
      const me = await authApi.getMe()
      throw redirect({ to: resolvePostAuthPath(me.data.data) })
    } catch (error) {
      if (isRedirect(error)) {
        throw error
      }
      localStorage.removeItem(TOKEN_KEY)
      throw redirect({ to: '/login' })
    }
  },
})
