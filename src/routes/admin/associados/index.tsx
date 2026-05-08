import { createFileRoute } from '@tanstack/react-router'

import { MemberListPage } from '@/pages/member/member-list-page'

export const Route = createFileRoute('/admin/associados/')({
  component: MemberListPage,
})
