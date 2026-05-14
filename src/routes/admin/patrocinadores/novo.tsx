import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

import { RoutePendingFallback } from '@/components/route-pending-fallback'

export const Route = createFileRoute('/admin/patrocinadores/novo')({
  pendingComponent: RoutePendingFallback,
  component: lazyRouteComponent(
    () => import('@/pages/sponsor/sponsor-create-page'),
    'SponsorCreatePage',
  ),
})
