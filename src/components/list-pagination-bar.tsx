import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function visiblePageItems(
  current: number,
  total: number
): (number | 'ellipsis')[] {
  if (total <= 0) return []
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const pages = new Set<number>()
  pages.add(1)
  pages.add(total)
  for (let d = -1; d <= 1; d++) {
    const p = current + d
    if (p >= 1 && p <= total) pages.add(p)
  }
  const sorted = [...pages].sort((a, b) => a - b)
  const out: (number | 'ellipsis')[] = []
  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i]
    if (i > 0 && p - sorted[i - 1] > 1) {
      out.push('ellipsis')
    }
    out.push(p)
  }
  return out
}

interface ListPaginationBarProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  /** Com `totalElements`, exibe “Mostrando a–b de n …”. */
  pageSize?: number
  totalElements?: number
  /** Ex.: "patrocinadores" em “Mostrando 1–10 de 96 patrocinadores”. */
  entityPlural?: string
  children?: ReactNode
}

export function ListPaginationBar({
  page,
  totalPages,
  onPageChange,
  pageSize,
  totalElements,
  entityPlural,
  children,
}: ListPaginationBarProps) {
  const isFirstPage = page <= 1
  const isLastPage = totalPages === 0 || page >= Math.max(totalPages, 1)
  const items = visiblePageItems(page, totalPages)

  const showRangeSummary =
    pageSize != null &&
    totalElements != null &&
    entityPlural != null &&
    totalElements > 0

  let leftContent: ReactNode = children
  if (showRangeSummary) {
    const start = (page - 1) * pageSize + 1
    const end = Math.min(page * pageSize, totalElements)
    leftContent = (
      <span className="text-[#6B7280]">
        Mostrando {start}–{end} de {totalElements} {entityPlural}
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      {leftContent ? (
        <div className="text-sm">{leftContent}</div>
      ) : (
        <div />
      )}
      <nav
        className="flex flex-wrap items-center justify-end gap-1"
        aria-label="Paginação"
      >
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={isFirstPage}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          aria-label="Página anterior"
          className="size-8 shrink-0 border-[#E5E7EB] bg-card text-[#9CA3AF] hover:text-foreground disabled:opacity-50"
        >
          <ChevronLeft className="size-3.5" aria-hidden />
        </Button>
        {items.map((item, idx) =>
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${idx}`}
              className="flex min-w-8 items-center justify-center px-1 text-sm text-muted-foreground"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-label={`Ir para página ${item}`}
              aria-current={item === page ? 'page' : undefined}
              className={cn(
                'min-h-8 min-w-9 rounded-md px-3 text-[13px] transition-colors',
                item === page
                  ? 'bg-primary font-semibold text-primary-foreground'
                  : 'border border-[#E5E7EB] bg-card font-normal text-[#374151] hover:bg-muted/40'
              )}
            >
              {item}
            </button>
          )
        )}
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={isLastPage}
          onClick={() => onPageChange(page + 1)}
          aria-label="Próxima página"
          className="size-8 shrink-0 border-[#E5E7EB] bg-card text-[#9CA3AF] hover:text-foreground disabled:opacity-50"
        >
          <ChevronRight className="size-3.5" aria-hidden />
        </Button>
      </nav>
    </div>
  )
}
