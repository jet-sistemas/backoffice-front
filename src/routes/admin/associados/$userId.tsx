import { createFileRoute } from '@tanstack/react-router'

import { MemberDetailPage } from '@/pages/member/member-detail-page'

export const Route = createFileRoute('/admin/associados/$userId')({
  component: MemberDetailRoute,
})

function MemberDetailRoute() {
  const { userId } = Route.useParams()
  return <MemberDetailPage userId={userId} />
}
