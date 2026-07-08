import { PortalLayout } from '@/components/layout/portal-layout'
import { useAuth } from '@/contexts/auth-context'

export function SponsorPortalPage() {
  const { user } = useAuth()

  return (
    <PortalLayout title="Área do Patrocinador">
      <div className="mx-auto max-w-2xl rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="font-serif text-xl font-bold">Olá, {user?.name}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Em breve você poderá acompanhar aqui seus benefícios e o histórico
          de check-ins validados.
        </p>
      </div>
    </PortalLayout>
  )
}
