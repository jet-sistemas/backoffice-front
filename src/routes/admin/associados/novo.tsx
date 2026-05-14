import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

import { RoutePendingFallback } from '@/components/route-pending-fallback'

export const Route = createFileRoute('/admin/associados/novo')({
  pendingComponent: RoutePendingFallback,
  component: lazyRouteComponent(
    () => import('@/pages/member/member-create-page'),
    'MemberCreatePage',
  ),
})
