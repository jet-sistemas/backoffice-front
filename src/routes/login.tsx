import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginPage } from '@/pages/login-page'

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    const token = localStorage.getItem('@jet:token')
    if (token) {
      throw redirect({ to: '/admin' })
    }
  },
  component: LoginPage,
})
