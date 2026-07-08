import { createFileRoute, Navigate, redirect } from '@tanstack/react-router'
import { RoutePendingFallback } from '@/components/route-pending-fallback'
import { useAuth } from '@/contexts/auth-context'
import { TOKEN_KEY } from '@/lib/auth-session'
import { resolvePostLoginPath } from '@/lib/post-login-path'
import { SponsorPortalPage } from '@/pages/sponsor/sponsor-portal-page'

export const Route = createFileRoute('/patrocinador')({
  beforeLoad: () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      throw redirect({ to: '/login' })
    }
  },
  component: SponsorPortalGate,
})

function SponsorPortalGate() {
  const { user, isLoadingUser } = useAuth()

  if (isLoadingUser) {
    return <RoutePendingFallback />
  }

  if (user?.mustChangePassword) {
    return <Navigate to="/alterar-senha-obrigatoria" replace />
  }

  if (user && user.type !== 'SPONSOR' && user.type !== 'SPONSOR_MEMBER') {
    return <Navigate to={resolvePostLoginPath(user.type)} replace />
  }

  return <SponsorPortalPage />
}
