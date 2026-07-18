import { UserRound } from 'lucide-react'

import { resolveR2PublicUrl } from '@/lib/r2-public-url'
import { cn, formatCPF } from '@/lib/utils'
import type { MemberCardDTO } from '@/types/member-card'

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}

function memberTypeLabel(type: MemberCardDTO['memberType']) {
  return type === 'SPONSORED' ? 'Patrocinado' : 'Assinante'
}

interface DataFieldProps {
  label: string
  value: React.ReactNode
  className?: string
  valueClassName?: string
}

function DataField({ label, value, className, valueClassName }: DataFieldProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className={cn('font-semibold text-foreground', valueClassName)}>{value}</p>
    </div>
  )
}

interface MemberCardProps {
  card: MemberCardDTO
}

export function MemberCard({ card }: MemberCardProps) {
  const avatarUrl = resolveR2PublicUrl(card.avatarUrl)
  const initials = initialsFromName(card.name)

  return (
    <div className="mx-auto w-full max-w-xs">
      <div className="overflow-hidden rounded-3xl border shadow-xl shadow-primary/10">
        <div className="gradient-membership h-2" />

        <div className="bg-card px-7 pt-6 pb-8">
          <div className="flex items-center justify-between">
            <span className="gradient-membership rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
              {memberTypeLabel(card.memberType)}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              J&amp;T
            </span>
          </div>

          <div className="mt-7 flex justify-center">
            <div className="gradient-membership rounded-full p-[3px]">
              <div className="rounded-full bg-card p-1">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`Foto de ${card.name}`}
                    className="size-24 rounded-full object-cover"
                  />
                ) : (
                  <div
                    aria-label={`Iniciais de ${card.name}`}
                    className="flex size-24 items-center justify-center rounded-full bg-blue-50 text-2xl font-bold text-blue-400"
                  >
                    {initials !== '?' ? (
                      initials
                    ) : (
                      <UserRound className="size-9" aria-hidden />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 text-center">
            <h2 className="font-serif text-xl leading-tight font-bold text-foreground">
              {card.name}
            </h2>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Carteirinha de Membro
            </p>
          </div>

          <div className="my-6 h-px bg-border" />

          <div className="space-y-5">
            <DataField label="CPF" value={formatCPF(card.document)} />
            <DataField
              label="Código"
              value={card.code}
              valueClassName="gradient-membership-text text-3xl font-extrabold tracking-[0.3em]"
            />
          </div>
        </div>

        <div className="gradient-membership h-2" />
      </div>
    </div>
  )
}
