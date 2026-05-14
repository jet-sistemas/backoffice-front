import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

import { RoutePendingFallback } from '@/components/route-pending-fallback'

const MemberDetailPageLazy = lazyRouteComponent(
  () => import('@/pages/member/member-detail-page'),
  'MemberDetailPage',
)

export const Route = createFileRoute('/admin/associados/$userId')({
  pendingComponent: RoutePendingFallback,
  component: MemberDetailRoute,
})

function MemberDetailRoute() {
  const { userId } = Route.useParams()
  return <MemberDetailPageLazy userId={userId} />
}
