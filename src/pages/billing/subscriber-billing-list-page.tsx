import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Search,
  UserRound,
  Wallet,
} from 'lucide-react'

import { ListPaginationBar } from '@/components/list-pagination-bar'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useMarkSubscriberPaidMutation } from '@/hooks/use-mark-subscriber-paid-mutation'
import { useSubscriberBillingListQuery } from '@/hooks/use-subscriber-billing-list-query'
import { isPaidCycleAlreadyRegistered } from '@/lib/subscriber-payment-mark'
import { BILLING_STATUS_BADGE } from '@/pages/member/subscriber-billing-widgets'
import { formatDocument, formatDatePtBR, formatDateTimePtBR } from '@/lib/utils'
import type { SubscriberBillingRowDTO } from '@/types/billing'
import type { MemberStatusEnum } from '@/types/member'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 500

const STATUS_FILTER_VALUES = [
  'ALL',
  'ACTIVE',
  'DUE_SOON',
  'OVERDUE',
  'INACTIVE',
] as const

type StatusFilter = (typeof STATUS_FILTER_VALUES)[number]

const STATUS_FILTER_LABEL: Record<StatusFilter, string> = {
  ALL: 'Todos',
  ACTIVE: 'Ativas',
  DUE_SOON: 'A vencer',
  OVERDUE: 'Em atraso',
  INACTIVE: 'Inativas',
}

function formatBrl(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function SubscriberBillingPaidButton({
  row,
  markPaidPending,
  onOpenMarkPaid,
}: {
  row: SubscriberBillingRowDTO
  markPaidPending: boolean
  onOpenMarkPaid: (row: SubscriberBillingRowDTO) => void
}) {
  const paidCycleUi =
    row.canMarkPayment === false &&
    row.status === 'ACTIVE' &&
    isPaidCycleAlreadyRegistered(row)

  const blocked =
    row.status === 'INACTIVE' ||
    row.canMarkPayment === false ||
    markPaidPending

  const tooltipReason =
    row.canMarkPayment === false &&
    row.paymentMarkBlockedReason &&
    !paidCycleUi
      ? row.paymentMarkBlockedReason
      : undefined

  if (paidCycleUi) {
    return (
      <Button type="button" variant="outline" size="sm" disabled>
        <CheckCircle2 className="size-4" aria-hidden />
        Pago neste mês
      </Button>
    )
  }

  const btn = (
    <Button
      type="button"
      variant="success"
      size="sm"
      onClick={() => onOpenMarkPaid(row)}
      disabled={blocked}
    >
      <Wallet className="size-4" aria-hidden />
      Pago
    </Button>
  )

  if (tooltipReason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">{btn}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipReason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return btn
}

export function SubscriberBillingListPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [dueFrom, setDueFrom] = useState('')
  const [dueTo, setDueTo] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedValue(searchTerm, SEARCH_DEBOUNCE_MS)

  const searchQuery =
    debouncedSearch.trim() !== '' ? debouncedSearch.trim() : undefined

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter, dueFrom, dueTo])

  const { data, isLoading, isFetching, isError, error, refetch } =
    useSubscriberBillingListQuery({
      page,
      size: PAGE_SIZE,
      status: statusFilter === 'ALL' ? 'ALL' : (statusFilter as MemberStatusEnum),
      dueFrom: dueFrom === '' ? undefined : dueFrom,
      dueTo: dueTo === '' ? undefined : dueTo,
      search: searchQuery,
    })

  const rows = data?.rows ?? []
  const totalPages = data?.totalPages ?? 0
  const totalElements = data?.totalElements ?? 0
  const summary = data?.summary
  const showSummarySkeleton = isLoading && summary == null

  const searchSettling = searchTerm.trim() !== debouncedSearch.trim()
  const listFetchBusy = isLoading || isFetching
  const listUiStale = listFetchBusy || searchSettling

  const [paidDialogOpen, setPaidDialogOpen] = useState(false)
  const [rowForPaid, setRowForPaid] = useState<SubscriberBillingRowDTO | null>(null)
  const markPaidMutation = useMarkSubscriberPaidMutation()

  const openMarkPaid = (row: SubscriberBillingRowDTO) => {
    if (row.canMarkPayment === false) return
    setRowForPaid(row)
    setPaidDialogOpen(true)
  }

  const closeMarkPaid = () => {
    setPaidDialogOpen(false)
    setRowForPaid(null)
  }

  const confirmMarkPaid = () => {
    if (rowForPaid == null) return
    markPaidMutation.mutate(
      { userId: rowForPaid.userId },
      { onSuccess: () => closeMarkPaid() },
    )
  }

  const hasDateFilter = dueFrom !== '' || dueTo !== ''
  const hasActiveSearch =
    debouncedSearch.trim().length > 0 || searchTerm.trim().length > 0

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('ALL')
    setDueFrom('')
    setDueTo('')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-2xl font-bold tracking-tight">Mensalidades</h1>
        <p className="text-sm text-muted-foreground">
          Cobrança manual: assinantes, vencimentos e registro de pagamento.
        </p>
      </div>

      {summary != null && (
        <section
          aria-label="Resumo por status"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Em atraso
            </p>
            <p className="mt-1 font-serif text-2xl font-bold tabular-nums">
              {summary.overdueCount}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              A vencer
            </p>
            <p className="mt-1 font-serif text-2xl font-bold tabular-nums">
              {summary.dueSoonCount}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Ativas
            </p>
            <p className="mt-1 font-serif text-2xl font-bold tabular-nums">
              {summary.activeCount}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Inativas
            </p>
            <p className="mt-1 font-serif text-2xl font-bold tabular-nums">
              {summary.inactiveCount}
            </p>
          </div>
        </section>
      )}

      {showSummarySkeleton && !isError && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((k) => (
            <Skeleton key={k} className="h-24 rounded-lg" />
          ))}
        </div>
      )}

      <section
        aria-labelledby="billing-filters-heading"
        className="rounded-lg border bg-card p-4 shadow-sm"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2
              id="billing-filters-heading"
              className="text-sm font-semibold leading-none"
            >
              Filtrar e buscar
            </h2>
            <p className="max-w-2xl text-xs text-muted-foreground">
              Filtros no servidor. Busca com pausa na digitação. Lista mantém página
              anterior durante atualização.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2 self-start sm:flex-row sm:items-center">
            {listUiStale && (
              <p
                className="flex items-center gap-2 text-xs text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                <Loader2
                  className="size-4 shrink-0 animate-spin text-muted-foreground"
                  aria-hidden
                />
                {listFetchBusy ? 'Atualizando…' : 'Aguardando busca…'}
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={listFetchBusy}
            >
              <RefreshCw className="size-4" />
              Atualizar
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-12">
          <div className="space-y-2 lg:col-span-3">
            <Label htmlFor="billing-status">Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <SelectTrigger id="billing-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTER_VALUES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_FILTER_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-4">
            <div className="space-y-2">
              <Label htmlFor="due-from">Vencimento de</Label>
              <Input
                id="due-from"
                type="date"
                value={dueFrom}
                onChange={(e) => setDueFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due-to">até</Label>
              <Input
                id="due-to"
                type="date"
                value={dueTo}
                onChange={(e) => setDueTo(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2 lg:col-span-5">
            <Label htmlFor="billing-search">Busca</Label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="billing-search"
                className="pl-9"
                placeholder="Nome, e-mail, documento, código, WhatsApp…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                maxLength={200}
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        {(statusFilter !== 'ALL' || hasDateFilter || hasActiveSearch) && (
          <div className="mt-3 flex justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </div>
        )}
      </section>

      {isError && (
        <div
          className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive"
          role="alert"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">Erro ao carregar mensalidades</p>
            <p className="text-destructive/90">{error?.message ?? 'Tente novamente.'}</p>
          </div>
        </div>
      )}

      <div
        className={listUiStale ? 'rounded-lg border opacity-90 transition-opacity' : ''}
        aria-busy={listUiStale ? true : undefined}
      >
        <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Associado</TableHead>
                <TableHead className="whitespace-nowrap">Valor / dia</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="whitespace-nowrap">Vencimento</TableHead>
                <TableHead className="whitespace-nowrap">Último pagamento</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && rows.length === 0 && (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`sk-${i}`}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              {!isLoading && !isError && rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Nenhum assinante encontrado com os filtros atuais.
                  </TableCell>
                </TableRow>
              )}
              {!isError &&
                rows.map((row) => {
                  const st = BILLING_STATUS_BADGE[row.status]
                  return (
                    <TableRow key={`${row.userId}-${row.memberId}`}>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">{row.fullname}</span>
                          <span className="text-xs text-muted-foreground">{row.email}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDocument(row.document)} · {row.whatsapp}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatBrl(row.monthlyFeeAmount)}
                        <span className="text-muted-foreground"> · dia {row.billingDay}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className={st.className}>
                          {st.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatDatePtBR(row.nextDueDate) || '—'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {row.lastPaidAt
                          ? formatDateTimePtBR(row.lastPaidAt)
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link
                              to="/admin/associados/$userId"
                              params={{ userId: String(row.userId) }}
                            >
                              <UserRound className="size-4" />
                              Ver
                            </Link>
                          </Button>
                          <SubscriberBillingPaidButton
                            row={row}
                            markPaidPending={markPaidMutation.isPending}
                            onOpenMarkPaid={openMarkPaid}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4">
          <ListPaginationBar
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={PAGE_SIZE}
            totalElements={totalElements}
            entityPlural="assinantes"
            disabled={listFetchBusy && rows.length === 0}
          />
        </div>
      </div>

      <AlertDialog open={paidDialogOpen} onOpenChange={(open) => {
        setPaidDialogOpen(open)
        if (!open) setRowForPaid(null)
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registrar pagamento</AlertDialogTitle>
            <AlertDialogDescription>
              {rowForPaid != null ? (
                <>
                  Confirma pagamento para <strong>{rowForPaid.fullname}</strong>? Vencimento
                  avança e status volta para Ativa.
                  {rowForPaid.status === 'OVERDUE' ? (
                    <>
                      {' '}
                      Se o atraso for de competência anterior ao mês atual, o primeiro registro só confirma o recebimento;
                      o segundo atualiza o próximo vencimento.
                    </>
                  ) : null}
                </>
              ) : (
                'Confirma o registro de pagamento?'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={markPaidMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <Button
              type="button"
              disabled={markPaidMutation.isPending}
              onClick={confirmMarkPaid}
            >
              {markPaidMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Registrando…
                </>
              ) : (
                'Confirmar'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
