import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/membro/')({
  beforeLoad: () => {
    throw redirect({ to: '/membro/carteirinha' })
  },
})
