import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertCircle, ClipboardList, Loader2, RefreshCw, Trash2 } from 'lucide-react'

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
import { useAdminCheckinListQuery } from '@/hooks/use-admin-checkin-list-query'
import { useMemberListQuery } from '@/hooks/use-member-list-query'
import { useUserListQuery } from '@/hooks/use-user-list-query'
import { cn } from '@/lib/utils'
import { isUserWithSponsor } from '@/types/user'
import type { AdminCheckinStatusFilter } from '@/types/admin-checkin'

const PAGE_SIZE = 10
const ALL = 'all'
const FILTER_OPTIONS_SIZE = 50
const TABLE_COLUMN_COUNT = 9

function statusLabel(validated: boolean) {
  return validated ? 'Confirmado' : 'Não confirmado'
}

function statusBadgeVariant(validated: boolean): 'default' | 'secondary' {
  return validated ? 'default' : 'secondary'
}

export function AdminCheckinListPage() {
  const [page, setPage] = useState(1)
  const [sponsorId, setSponsorId] = useState<string>(ALL)
  const [memberUserId, setMemberUserId] = useState<string>(ALL)
  const [statusFilter, setStatusFilter] = useState<AdminCheckinStatusFilter>(ALL)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const dateRangeInvalid =
    startDate !== '' && endDate !== '' && startDate > endDate

  const sponsorsQuery = useUserListQuery({
    type: 'SPONSOR',
    page: 1,
    size: FILTER_OPTIONS_SIZE,
  })
  const membersQuery = useMemberListQuery({
    page: 1,
    size: FILTER_OPTIONS_SIZE,
  })

  const sponsorOptions = useMemo(
    () =>
      (sponsorsQuery.data?.data ?? []).flatMap((user) => {
        if (!isUserWithSponsor(user) || user.sponsor == null) return []
        return [{
          sponsorId: user.sponsor.id,
          publicName: user.sponsor.publicName,
          active: user.sponsor.isActive,
        }]
      }),
    [sponsorsQuery.data?.data],
  )

  const memberOptions = membersQuery.data?.data ?? []

  const listParams = useMemo(
    () => ({
      page,
      size: PAGE_SIZE,
      ...(sponsorId !== ALL ? { sponsorId: Number(sponsorId) } : {}),
      ...(memberUserId !== ALL ? { memberUserId: Number(memberUserId) } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      ...(statusFilter === 'true' ? { validated: true } : {}),
      ...(statusFilter === 'false' ? { validated: false } : {}),
    }),
    [page, sponsorId, memberUserId, startDate, endDate, statusFilter],
  )

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAdminCheckinListQuery(listParams, !dateRangeInvalid)

  const rows = data?.data ?? []
  const totalPages = data?.totalPages ?? 0
  const totalElements = data?.totalElements ?? 0

  const listFetchBusy = isLoading || isFetching
  const hasActiveFilters =
    sponsorId !== ALL
    || memberUserId !== ALL
    || statusFilter !== ALL
    || startDate !== ''
    || endDate !== ''

  const clearAllFilters = () => {
    setSponsorId(ALL)
    setMemberUserId(ALL)
    setStatusFilter(ALL)
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">Check-ins</h1>
        <p className="text-sm text-muted-foreground">
          Visão global de check-ins confirmados e tentativas não confirmadas.
        </p>
      </div>

      <section
        aria-labelledby="admin-checkin-filters-heading"
        className="rounded-lg border bg-card p-4 shadow-sm"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2
              id="admin-checkin-filters-heading"
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
            'mt-4 grid gap-4 transition-opacity duration-200 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
            listFetchBusy && !dateRangeInvalid && 'pointer-events-none opacity-50',
          )}
          aria-busy={listFetchBusy && !dateRangeInvalid ? true : undefined}
        >
          <div className="space-y-2">
            <Label htmlFor="sponsorFilter">Patrocinador</Label>
            <Select
              value={sponsorId}
              onValueChange={(value) => {
                setSponsorId(value)
                setPage(1)
              }}
              disabled={listFetchBusy}
            >
              <SelectTrigger id="sponsorFilter" aria-label="Patrocinador">
                <SelectValue placeholder="Todos os patrocinadores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos os patrocinadores</SelectItem>
                {sponsorOptions.map((s) => (
                  <SelectItem key={s.sponsorId} value={String(s.sponsorId)}>
                    {s.publicName}
                    {!s.active ? ' (inativo)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="memberFilter">Membro</Label>
            <Select
              value={memberUserId}
              onValueChange={(value) => {
                setMemberUserId(value)
                setPage(1)
              }}
              disabled={listFetchBusy}
            >
              <SelectTrigger id="memberFilter" aria-label="Membro">
                <SelectValue placeholder="Todos os membros" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos os membros</SelectItem>
                {memberOptions.map((m) => (
                  <SelectItem key={m.userId} value={String(m.userId)}>
                    {m.member.fullname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="statusFilter">Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as AdminCheckinStatusFilter)
                setPage(1)
              }}
              disabled={listFetchBusy}
            >
              <SelectTrigger id="statusFilter" aria-label="Status">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos</SelectItem>
                <SelectItem value="true">Confirmados</SelectItem>
                <SelectItem value="false">Não confirmados</SelectItem>
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
                  {Array.from({ length: TABLE_COLUMN_COUNT }).map((_, i) => (
                    <TableHead key={i}>—</TableHead>
                  ))}
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
          <div className="space-y-3 md:hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        </>
      )}

      {isError && !dateRangeInvalid && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 py-12">
          <AlertCircle className="size-10 text-destructive" />
          <div className="text-center">
            <p className="font-medium">Erro ao carregar check-ins</p>
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
            <ClipboardList className="size-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">
              {hasActiveFilters
                ? 'Nenhum check-in encontrado para os filtros selecionados.'
                : 'Nenhum check-in registrado.'}
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
                  <TableHead>Membro</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Duplicidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const checkedInAt = new Date(row.checkedInAt)
                  return (
                    <TableRow key={row.id}>
                      <TableCell>
                        {format(checkedInAt, 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {format(checkedInAt, 'HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell>{row.sponsor.publicName}</TableCell>
                      <TableCell>{row.member.name}</TableCell>
                      <TableCell>{row.member.code}</TableCell>
                      <TableCell>{row.member.documentMasked}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(row.validated)}>
                          {statusLabel(row.validated)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate">
                        {row.reason ?? '—'}
                      </TableCell>
                      <TableCell>{row.duplicateConfirmed ? 'Sim' : 'Não'}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div
            className={cn(
              'space-y-3 md:hidden',
              isFetching && 'pointer-events-none opacity-50',
            )}
            aria-busy={isFetching ? true : undefined}
          >
            {rows.map((row) => {
              const checkedInAt = new Date(row.checkedInAt)
              return (
                <article
                  key={row.id}
                  className="rounded-lg border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{row.sponsor.publicName}</p>
                      <p className="text-sm text-muted-foreground">{row.member.name}</p>
                    </div>
                    <Badge variant={statusBadgeVariant(row.validated)}>
                      {statusLabel(row.validated)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {format(checkedInAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                  {row.reason && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Motivo: {row.reason}
                    </p>
                  )}
                </article>
              )
            })}
          </div>

          <ListPaginationBar
            page={page}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            totalElements={totalElements}
            entityPlural="check-ins"
            disabled={listFetchBusy}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}
