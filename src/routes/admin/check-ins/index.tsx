import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

import { RoutePendingFallback } from '@/components/route-pending-fallback'

export const Route = createFileRoute('/admin/check-ins/')({
  pendingComponent: RoutePendingFallback,
  component: lazyRouteComponent(
    () => import('@/pages/checkin/admin-checkin-list-page'),
    'AdminCheckinListPage',
  ),
})
