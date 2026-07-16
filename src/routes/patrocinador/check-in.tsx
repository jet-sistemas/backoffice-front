import { createFileRoute } from '@tanstack/react-router'

import { SponsorCheckinPage } from '@/pages/sponsor/sponsor-checkin-page'

export const Route = createFileRoute('/patrocinador/check-in')({
  component: SponsorCheckinPage,
})
