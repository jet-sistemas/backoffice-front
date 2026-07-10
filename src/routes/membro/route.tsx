import { createFileRoute, Navigate, redirect } from '@tanstack/react-router'

import { MemberLayout } from '@/components/layout/member-layout'
import { RoutePendingFallback } from '@/components/route-pending-fallback'
import { useAuth } from '@/contexts/auth-context'
import { TOKEN_KEY } from '@/lib/auth-session'
import { resolvePostLoginPath } from '@/lib/post-login-path'

export const Route = createFileRoute('/membro')({
  beforeLoad: () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      throw redirect({ to: '/login' })
    }
  },
  component: MemberRouteGate,
})

function MemberRouteGate() {
  const { user, isLoadingUser } = useAuth()

  if (isLoadingUser) {
    return <RoutePendingFallback />
  }

  if (user?.mustChangePassword) {
    return <Navigate to="/alterar-senha-obrigatoria" replace />
  }

  if (user && user.type !== 'MEMBER') {
    return <Navigate to={resolvePostLoginPath(user.type)} replace />
  }

  return <MemberLayout />
}
