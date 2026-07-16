import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertCircle, History, Loader2, RefreshCw, Trash2 } from 'lucide-react'

import { DatePicker } from '@/components/date-picker'
import { ListPaginationBar } from '@/components/list-pagination-bar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useSponsorCheckinListQuery } from '@/hooks/use-sponsor-checkin-list-query'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 10
const TABLE_COLUMN_COUNT = 6

export function SponsorCheckinHistoryPage() {
  const [page, setPage] = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useSponsorCheckinListQuery({
    page,
    size: PAGE_SIZE,
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
  })

  const rows = data?.data ?? []
  const totalPages = data?.totalPages ?? 0
  const totalElements = data?.totalElements ?? 0

  const listFetchBusy = isLoading || isFetching
  const hasActiveFilters = startDate !== '' || endDate !== ''

  const clearAllFilters = () => {
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">Histórico</h1>
        <p className="text-sm text-muted-foreground">
          Check-ins realizados pela sua empresa.
        </p>
      </div>

      <section
        aria-labelledby="checkin-history-filters-heading"
        className="rounded-lg border bg-card p-4 shadow-sm"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2
              id="checkin-history-filters-heading"
              className="text-sm font-semibold leading-none"
            >
              Filtrar e buscar
            </h2>
            <p className="max-w-2xl text-xs text-muted-foreground">
              Filtros refinam no servidor. A paginação reflete o resultado da consulta.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2 self-start sm:flex-row sm:items-center">
            {listFetchBusy && (
              <p
                className="flex items-center gap-2 text-xs text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                <Loader2
                  className="size-4 shrink-0 animate-spin text-muted-foreground"
                  aria-hidden
                />
                Atualizando lista…
              </p>
            )}
            {hasActiveFilters && !listFetchBusy && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-600 hover:text-white dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
                onClick={clearAllFilters}
              >
                Limpar tudo
                <Trash2 aria-hidden className="size-4" />
              </Button>
            )}
          </div>
        </div>

        <div
          className={cn(
            'mt-4 grid gap-4 transition-opacity duration-200 sm:grid-cols-2',
            listFetchBusy && 'pointer-events-none opacity-50',
          )}
          aria-busy={listFetchBusy ? true : undefined}
        >
          <div className="space-y-2">
            <Label htmlFor="startDate">De</Label>
            <DatePicker
              id="startDate"
              value={startDate || undefined}
              onChange={(v) => {
                setStartDate(v ?? '')
                setPage(1)
              }}
              disabled={listFetchBusy}
              placeholder="Selecione uma data"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Até</Label>
            <DatePicker
              id="endDate"
              value={endDate || undefined}
              onChange={(v) => {
                setEndDate(v ?? '')
                setPage(1)
              }}
              disabled={listFetchBusy}
              placeholder="Selecione uma data"
            />
          </div>
        </div>
      </section>

      {isLoading && (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/hora</TableHead>
                <TableHead>Membro</TableHead>
                <TableHead>Código</TableHead>
                <TableHead className="hidden sm:table-cell">CPF</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={TABLE_COLUMN_COUNT}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 py-12">
          <AlertCircle className="size-10 text-destructive" />
          <div className="text-center">
            <p className="font-medium">Erro ao carregar histórico</p>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Tente novamente mais tarde.'}
            </p>
          </div>
          <Button variant="outline" disabled={listFetchBusy} onClick={() => void refetch()}>
            <RefreshCw />
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && !isError && rows.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <History className="size-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Nenhum check-in encontrado</p>
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters
                ? 'Tente ajustar o período da busca.'
                : 'Os check-ins realizados aparecerão aqui.'}
            </p>
          </div>
        </div>
      )}

      {!isLoading && !isError && rows.length > 0 && (
        <>
          <div
            className={cn(
              'rounded-lg border bg-card transition-opacity duration-200',
              isFetching && 'pointer-events-none opacity-50',
            )}
            aria-busy={isFetching ? true : undefined}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/hora</TableHead>
                  <TableHead>Membro</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead className="hidden sm:table-cell">CPF</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(row.createdAt), 'dd/MM/yyyy HH:mm', {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>{row.member.name}</TableCell>
                    <TableCell>
                      <code className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-bold">
                        {row.member.code}
                      </code>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {row.member.documentMasked}
                    </TableCell>
                    <TableCell>
                      {row.validated ? (
                        <Badge
                          variant="default"
                          className="bg-emerald-600 text-white hover:bg-emerald-600/90"
                        >
                          Validado
                        </Badge>
                      ) : (
                        <Badge
                          variant="destructive"
                          className="bg-red-600 text-white hover:bg-red-600/90"
                        >
                          Não validado
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden max-w-[12rem] truncate text-muted-foreground md:table-cell">
                      {row.reason ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ListPaginationBar
            page={page}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            totalElements={totalElements}
            entityPlural="check-ins"
            onPageChange={setPage}
            disabled={listFetchBusy}
          />
        </>
      )}
    </div>
  )
}
