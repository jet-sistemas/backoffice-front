import { createFileRoute, redirect } from '@tanstack/react-router'
import { AdminLayout } from '@/components/layout/admin-layout'

export const Route = createFileRoute('/admin')({
  beforeLoad: () => {
    const token = localStorage.getItem('@jet:token')
    if (!token) {
      throw redirect({ to: '/login' })
    }
  },
  component: AdminLayout,
})
