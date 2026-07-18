import { useState } from 'react'
import { AlertCircle, Gift, Loader2, RefreshCw } from 'lucide-react'

import { ListPaginationBar } from '@/components/list-pagination-bar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useMemberBenefitListQuery } from '@/hooks/use-member-benefit-list-query'
import { resolveR2PublicUrl } from '@/lib/r2-public-url'
import { cn } from '@/lib/utils'
import type { MemberBenefitDTO } from '@/types/member-benefit'

const PAGE_SIZE = 10

function SponsorAvatar({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  const resolved = resolveR2PublicUrl(logoUrl)
  if (resolved) {
    return (
      <img
        src={resolved}
        alt=""
        className="size-10 shrink-0 rounded-md border object-cover"
      />
    )
  }
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted text-xs font-semibold">
      {initials || '?'}
    </div>
  )
}

function BenefitCard({ benefit }: { benefit: MemberBenefitDTO }) {
  const isAssociation = benefit.sponsor == null

  return (
    <li className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {benefit.sponsor ? (
          <SponsorAvatar
            name={benefit.sponsor.publicName}
            logoUrl={benefit.sponsor.logoUrl}
          />
        ) : (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted">
            <Gift className="size-5 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="space-y-1">
            <h2 className="font-medium leading-tight">{benefit.name}</h2>
            {isAssociation ? (
              <Badge variant="secondary">Benefício da associação</Badge>
            ) : (
              <p className="text-sm text-muted-foreground">{benefit.sponsor?.publicName}</p>
            )}
          </div>
          {benefit.description && (
            <p className="text-sm text-muted-foreground">{benefit.description}</p>
          )}
          {benefit.address && (
            <p className="text-xs text-muted-foreground">{benefit.address}</p>
          )}
        </div>
      </div>
    </li>
  )
}

export function MemberBenefitsPage() {
  const [page, setPage] = useState(1)
  const listQuery = useMemberBenefitListQuery({ page, size: PAGE_SIZE })

  const rows = listQuery.data?.data ?? []
  const totalPages = listQuery.data?.totalPages ?? 0
  const totalElements = listQuery.data?.totalElements ?? 0
  const listFetchBusy = listQuery.isLoading || listQuery.isFetching

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">Benefícios</h1>
        <p className="text-sm text-muted-foreground">
          Confira benefícios ativos disponíveis para membros.
        </p>
      </div>

      {listFetchBusy && (
        <p
          className="flex items-center gap-2 text-xs text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
          Atualizando lista…
        </p>
      )}

      {listQuery.isLoading && (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      )}

      {listQuery.isError && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 py-12">
          <AlertCircle className="size-10 text-destructive" />
          <div className="text-center">
            <p className="font-medium">Erro ao carregar benefícios</p>
            <p className="text-sm text-muted-foreground">
              {listQuery.error instanceof Error
                ? listQuery.error.message
                : 'Tente novamente mais tarde.'}
            </p>
          </div>
          <Button
            variant="outline"
            disabled={listFetchBusy}
            onClick={() => void listQuery.refetch()}
          >
            <RefreshCw />
            Tentar novamente
          </Button>
        </div>
      )}

      {!listQuery.isLoading && !listQuery.isError && rows.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Gift className="size-8 text-muted-foreground" />
          </div>
          <p className="font-medium">Nenhum benefício ativo disponível.</p>
        </div>
      )}

      {!listQuery.isLoading && !listQuery.isError && rows.length > 0 && (
        <>
          <ul
            className={cn(
              'grid gap-3 sm:grid-cols-2',
              listQuery.isFetching && 'pointer-events-none opacity-50',
            )}
            aria-busy={listQuery.isFetching ? true : undefined}
          >
            {rows.map((benefit) => (
              <BenefitCard key={benefit.id} benefit={benefit} />
            ))}
          </ul>

          <ListPaginationBar
            page={page}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            totalElements={totalElements}
            entityPlural="benefícios"
            onPageChange={setPage}
            disabled={listFetchBusy}
          />
        </>
      )}
    </div>
  )
}
