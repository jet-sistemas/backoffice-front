import { createFileRoute } from '@tanstack/react-router'

import { MemberCreatePage } from '@/pages/member/member-create-page'

export const Route = createFileRoute('/admin/associados/novo')({
  component: MemberCreatePage,
})
