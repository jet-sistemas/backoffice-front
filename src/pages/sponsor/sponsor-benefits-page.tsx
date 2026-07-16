import { useState } from 'react'
import { AlertCircle, Gift } from 'lucide-react'

import { ListPaginationBar } from '@/components/list-pagination-bar'
import { Skeleton } from '@/components/ui/skeleton'
import { useSponsorBenefitListQuery } from '@/hooks/use-sponsor-benefit-list-query'

const PAGE_SIZE = 10

export function SponsorBenefitsPage() {
  const [page, setPage] = useState(1)
  const listQuery = useSponsorBenefitListQuery(page, PAGE_SIZE)

  const rows = listQuery.data?.data ?? []
  const totalPages = listQuery.data?.totalPages ?? 0
  const totalElements = listQuery.data?.totalElements ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Benefícios</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Benefícios ativos vinculados à sua empresa (somente leitura).
        </p>
      </div>

      {listQuery.isError && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{listQuery.error.message}</p>
        </div>
      )}

      {listQuery.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!listQuery.isLoading && rows.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-muted-foreground">
          <Gift className="size-8 opacity-50" />
          <p className="text-sm">Nenhum benefício ativo no momento.</p>
        </div>
      )}

      <ul className="space-y-3">
        {rows.map((b) => (
          <li key={b.id} className="rounded-lg border bg-card p-4 shadow-sm">
            <h2 className="font-medium">{b.name}</h2>
            {b.description && (
              <p className="mt-1 text-sm text-muted-foreground">{b.description}</p>
            )}
            {b.address && (
              <p className="mt-2 text-xs text-muted-foreground">{b.address}</p>
            )}
          </li>
        ))}
      </ul>

      <ListPaginationBar
        page={page}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        totalElements={totalElements}
        onPageChange={setPage}
      />
    </div>
  )
}
