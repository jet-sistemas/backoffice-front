import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

import { RoutePendingFallback } from '@/components/route-pending-fallback'

export const Route = createFileRoute('/admin/mensalidades/')({
  pendingComponent: RoutePendingFallback,
  component: lazyRouteComponent(
    () => import('@/pages/billing/subscriber-billing-list-page'),
    'SubscriberBillingListPage',
  ),
})
