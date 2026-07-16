import { createFileRoute } from '@tanstack/react-router'

import { MemberBenefitsPage } from '@/pages/member/member-benefits-page'

export const Route = createFileRoute('/membro/beneficios')({
  component: MemberBenefitsPage,
})
