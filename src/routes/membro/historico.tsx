import { createFileRoute } from '@tanstack/react-router'

import { MemberCheckinHistoryPage } from '@/pages/member/member-checkin-history-page'

export const Route = createFileRoute('/membro/historico')({
  component: MemberCheckinHistoryPage,
})
