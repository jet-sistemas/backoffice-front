import { createFileRoute, redirect } from '@tanstack/react-router'
import { ValidarContaPage } from '@/pages/validar-conta-page'

export const Route = createFileRoute('/validar-conta/$token')({
  component: ValidarContaRoute,
})

function ValidarContaRoute() {
  const { token } = Route.useParams()
  return <ValidarContaPage token={token} />
}
