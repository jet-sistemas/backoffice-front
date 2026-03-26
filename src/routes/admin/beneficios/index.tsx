import { createFileRoute } from '@tanstack/react-router'

import { BenefitListPage } from '@/pages/benefit/benefit-list-page'

export const Route = createFileRoute('/admin/beneficios/')({
  component: BenefitListPage,
})
