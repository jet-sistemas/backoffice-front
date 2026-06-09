import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

import { RoutePendingFallback } from '@/components/route-pending-fallback'

const SponsorEditPageLazy = lazyRouteComponent(
  () => import('@/pages/sponsor/sponsor-edit-page'),
  'SponsorEditPage',
)

export const Route = createFileRoute('/admin/patrocinadores/$userId/editar')({
  pendingComponent: RoutePendingFallback,
  component: SponsorEditRoute,
})

function SponsorEditRoute() {
  const { userId } = Route.useParams()
  return <SponsorEditPageLazy userId={userId} />
}
