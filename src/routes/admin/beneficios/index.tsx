import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

import { RoutePendingFallback } from '@/components/route-pending-fallback'

export const Route = createFileRoute('/admin/beneficios/')({
  pendingComponent: RoutePendingFallback,
  component: lazyRouteComponent(
    () => import('@/pages/benefit/benefit-list-page'),
    'BenefitListPage',
  ),
})
