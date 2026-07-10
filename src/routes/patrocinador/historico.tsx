import { createFileRoute } from '@tanstack/react-router'

import { SponsorCheckinHistoryPage } from '@/pages/sponsor/sponsor-checkin-history-page'

export const Route = createFileRoute('/patrocinador/historico')({
  component: SponsorCheckinHistoryPage,
})
