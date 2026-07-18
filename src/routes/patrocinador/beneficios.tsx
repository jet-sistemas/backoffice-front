import { createFileRoute } from '@tanstack/react-router'

import { SponsorBenefitsPage } from '@/pages/sponsor/sponsor-benefits-page'

export const Route = createFileRoute('/patrocinador/beneficios')({
  component: SponsorBenefitsPage,
})
