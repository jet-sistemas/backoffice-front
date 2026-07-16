import { createFileRoute, Navigate, redirect } from '@tanstack/react-router'

import { SponsorLayout } from '@/components/layout/sponsor-layout'
import { RoutePendingFallback } from '@/components/route-pending-fallback'
import { useAuth } from '@/contexts/auth-context'
import { TOKEN_KEY } from '@/lib/auth-session'
import { resolvePostLoginPath } from '@/lib/post-login-path'

export const Route = createFileRoute('/patrocinador')({
  beforeLoad: () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      throw redirect({ to: '/login' })
    }
  },
  component: SponsorRouteGate,
})

function SponsorRouteGate() {
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

  return <SponsorLayout />
}
