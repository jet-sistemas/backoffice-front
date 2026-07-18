import type { MemberStatusEnum } from '@/types/member'

export const BILLING_STATUS_BADGE: Record<
  MemberStatusEnum,
  { className: string; label: string }
> = {
  ACTIVE: { className: 'bg-emerald-600 text-white hover:bg-emerald-600/90', label: 'Ativa' },
  DUE_SOON: { className: 'bg-amber-500 text-amber-950 hover:bg-amber-500/90', label: 'A vencer' },
  OVERDUE: { className: 'bg-red-600 text-white hover:bg-red-600/90', label: 'Em atraso' },
  INACTIVE: {
    className: 'bg-neutral-200 text-neutral-600 hover:bg-neutral-200/90',
    label: 'Inativa',
  },
}
