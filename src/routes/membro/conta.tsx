import { createFileRoute } from '@tanstack/react-router'

import { MemberAccountPage } from '@/pages/member/member-account-page'

export const Route = createFileRoute('/membro/conta')({
  component: MemberAccountPage,
})
