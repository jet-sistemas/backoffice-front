import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertCircle, History, Loader2, RefreshCw, Trash2 } from 'lucide-react'

import { ListPaginationBar } from '@/components/list-pagination-bar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMemberCheckinListQuery } from '@/hooks/use-member-checkin-list-query'
import { useMemberCheckinSponsorOptionsQuery } from '@/hooks/use-member-checkin-sponsor-options-query'
import { resolveR2PublicUrl } from '@/lib/r2-public-url'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 10
const ALL_SPONSORS = 'all'

function SponsorAvatar({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  const resolved = resolveR2PublicUrl(logoUrl)
  if (resolved) {
    return (
      <img
        src={resolved}
        alt=""
        className="size-9 shrink-0 rounded-md border object-cover"
      />
    )
  }
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted text-xs font-semibold">
      {initials || '?'}
    </div>
  )
}

export function MemberCheckinHistoryPage() {
  const [page, setPage] = useState(1)
  const [sponsorId, setSponsorId] = useState<string>(ALL_SPONSORS)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const dateRangeInvalid =
    startDate !== '' && endDate !== '' && startDate > endDate

  const sponsorsQuery = useMemberCheckinSponsorOptionsQuery()
  const sponsorOptions = sponsorsQuery.data ?? []
  const sponsorFilterDisabled = sponsorOptions.length === 0

  const listParams = useMemo(
    () => ({
      page,
      size: PAGE_SIZE,
      ...(sponsorId !== ALL_SPONSORS ? { sponsorId: Number(sponsorId) } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    }),
    [page, sponsorId, startDate, endDate],
  )

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useMemberCheckinListQuery(listParams, !dateRangeInvalid)

  const rows = data?.data ?? []
  const totalPages = data?.totalPages ?? 0
  const totalElements = data?.totalElements ?? 0

  const listFetchBusy = isLoading || isFetching
  const hasActiveFilters =
    sponsorId !== ALL_SPONSORS || startDate !== '' || endDate !== ''

  const clearAllFilters = () => {
    setSponsorId(ALL_SPONSORS)
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          Histórico de Check-ins
        </h1>
        <p className="text-sm text-muted-foreground">
          Check-ins confirmados em patrocinadores parceiros.
        </p>
      </div>

      <section
        aria-labelledby="member-checkin-history-filters-heading"
        className="rounded-lg border bg-card p-4 shadow-sm"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2
              id="member-checkin-history-filters-heading"
              className="text-sm font-semibold leading-none"
            >
              Filtrar e buscar
            </h2>
            <p className="max-w-2xl text-xs text-muted-foreground">
              Filtros refinam no servidor. A paginação reflete o resultado da consulta.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2 self-start sm:flex-row sm:items-center">
            {listFetchBusy && !dateRangeInvalid && (
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
            'mt-4 grid gap-4 transition-opacity duration-200 sm:grid-cols-2 lg:grid-cols-3',
            listFetchBusy && !dateRangeInvalid && 'pointer-events-none opacity-50',
          )}
          aria-busy={listFetchBusy && !dateRangeInvalid ? true : undefined}
        >
          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
            <Label htmlFor="sponsorFilter">Patrocinador</Label>
            <Select
              value={sponsorId}
              onValueChange={(value) => {
                setSponsorId(value)
                setPage(1)
              }}
              disabled={sponsorFilterDisabled || listFetchBusy}
            >
              <SelectTrigger id="sponsorFilter" aria-label="Patrocinador">
                <SelectValue placeholder="Todos os patrocinadores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_SPONSORS}>Todos os patrocinadores</SelectItem>
                {sponsorOptions.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.publicName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">De</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                setPage(1)
              }}
              disabled={listFetchBusy}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Até</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                setPage(1)
              }}
              disabled={listFetchBusy}
            />
          </div>
        </div>

        {dateRangeInvalid && (
          <p className="mt-3 text-sm text-destructive" role="alert">
            A data inicial não pode ser posterior à data final.
          </p>
        )}
      </section>

      {isLoading && !dateRangeInvalid && (
        <>
          <div className="hidden rounded-lg border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Patrocinador</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="space-y-3 md:hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </>
      )}

      {isError && !dateRangeInvalid && (
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

      {!isLoading && !isError && !dateRangeInvalid && rows.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <History className="size-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">
              {hasActiveFilters
                ? 'Nenhum check-in encontrado para os filtros selecionados.'
                : 'Nenhum check-in encontrado.'}
            </p>
            {hasActiveFilters && (
              <p className="mt-1 text-sm text-muted-foreground">
                Tente ajustar os filtros ou limpar a busca.
              </p>
            )}
          </div>
        </div>
      )}

      {!isLoading && !isError && !dateRangeInvalid && rows.length > 0 && (
        <>
          <div
            className={cn(
              'hidden rounded-lg border bg-card transition-opacity duration-200 md:block',
              isFetching && 'pointer-events-none opacity-50',
            )}
            aria-busy={isFetching ? true : undefined}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Patrocinador</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const checkedInAt = new Date(row.checkedInAt)
                  return (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(checkedInAt, 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {format(checkedInAt, 'HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <SponsorAvatar
                            name={row.sponsor.publicName}
                            logoUrl={row.sponsor.logoUrl}
                          />
                          <span>{row.sponsor.publicName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="default"
                          className="bg-emerald-600 text-white hover:bg-emerald-600/90"
                        >
                          Check-in confirmado
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <ul
            className={cn(
              'space-y-3 md:hidden',
              isFetching && 'pointer-events-none opacity-50',
            )}
            aria-busy={isFetching ? true : undefined}
          >
            {rows.map((row) => {
              const checkedInAt = new Date(row.checkedInAt)
              return (
                <li key={row.id} className="rounded-lg border bg-card p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <SponsorAvatar
                      name={row.sponsor.publicName}
                      logoUrl={row.sponsor.logoUrl}
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-medium leading-tight">{row.sponsor.publicName}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(checkedInAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      <Badge
                        variant="default"
                        className="bg-emerald-600 text-white hover:bg-emerald-600/90"
                      >
                        Check-in confirmado
                      </Badge>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

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
