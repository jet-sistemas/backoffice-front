import { createFileRoute, redirect } from '@tanstack/react-router'
import { AdminHomePage } from '@/pages/admin-home-page'

export const Route = createFileRoute('/admin/')({
  beforeLoad: () => {
    const token = localStorage.getItem('@jet:token')
    if (!token) {
      throw redirect({ to: '/login' })
    }
  },
  component: AdminHomePage,
})
