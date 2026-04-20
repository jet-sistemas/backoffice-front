import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface ListPaginationBarProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  children?: React.ReactNode
}

export function ListPaginationBar({
  page,
  totalPages,
  onPageChange,
  children,
}: ListPaginationBarProps) {
  const pageCount = Math.max(totalPages, 1)
  const isFirstPage = page <= 1
  const isLastPage = totalPages === 0 || page >= pageCount

  return (
    <div className="flex items-center justify-between">
      {children && (
        <div className="text-sm text-muted-foreground">{children}</div>
      )}
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isFirstPage}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          aria-label="Página anterior"
        >
          <ChevronLeft />
          Anterior
        </Button>
        <span className="text-sm text-muted-foreground">
          Página {page} de {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={isLastPage}
          onClick={() => onPageChange(page + 1)}
          aria-label="Próxima página"
        >
          Próximo
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
