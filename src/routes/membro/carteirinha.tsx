import { createFileRoute } from '@tanstack/react-router'

import { MemberCardPage } from '@/pages/member/member-card-page'

export const Route = createFileRoute('/membro/carteirinha')({
  component: MemberCardPage,
})
