import { createFileRoute } from '@tanstack/react-router'

import { MemberDetailPage } from '@/pages/member/member-detail-page'

export const Route = createFileRoute('/admin/associados/$memberId')({
  component: MemberDetailRoute,
})

function MemberDetailRoute() {
  const { memberId } = Route.useParams()
  return <MemberDetailPage memberId={memberId} />
}
