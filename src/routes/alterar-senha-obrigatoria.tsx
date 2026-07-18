import { createFileRoute, redirect } from '@tanstack/react-router'
import { AlterarSenhaObrigatoriaPage } from '@/pages/alterar-senha-obrigatoria-page'

export const Route = createFileRoute('/alterar-senha-obrigatoria')({
  beforeLoad: () => {
    const token = localStorage.getItem('@jet:token')
    if (!token) {
      throw redirect({ to: '/login' })
    }
  },
  component: AlterarSenhaObrigatoriaPage,
})
