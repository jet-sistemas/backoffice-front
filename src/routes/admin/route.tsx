import { createFileRoute, Navigate, redirect } from '@tanstack/react-router'
import { AdminLayout } from '@/components/layout/admin-layout'
import { RoutePendingFallback } from '@/components/route-pending-fallback'
import { useAuth } from '@/contexts/auth-context'
import { resolvePostLoginPath } from '@/lib/post-login-path'

export const Route = createFileRoute('/admin')({
  beforeLoad: () => {
    const token = localStorage.getItem('@jet:token')
    if (!token) {
      throw redirect({ to: '/login' })
    }
  },
  component: AdminRouteGate,
})

function AdminRouteGate() {
  const { user, isLoadingUser } = useAuth()

  if (isLoadingUser) {
    return <RoutePendingFallback />
  }

  if (user?.mustChangePassword) {
    return <Navigate to="/alterar-senha-obrigatoria" replace />
  }

  if (user && user.type !== 'ADM') {
    return <Navigate to={resolvePostLoginPath(user.type)} replace />
  }

  return <AdminLayout />
}
