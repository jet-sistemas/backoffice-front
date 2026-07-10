import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/patrocinador/')({
  beforeLoad: () => {
    throw redirect({ to: '/patrocinador/check-in' })
  },
})
