import { createFileRoute, Navigate, redirect } from '@tanstack/react-router'
import { RoutePendingFallback } from '@/components/route-pending-fallback'
import { useAuth } from '@/contexts/auth-context'
import { TOKEN_KEY } from '@/lib/auth-session'
import { resolvePostLoginPath } from '@/lib/post-login-path'
import { MemberPortalPage } from '@/pages/member/member-portal-page'

export const Route = createFileRoute('/membro')({
  beforeLoad: () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      throw redirect({ to: '/login' })
    }
  },
  component: MemberPortalGate,
})

function MemberPortalGate() {
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

  return <MemberPortalPage />
}
