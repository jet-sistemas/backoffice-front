import { useState } from 'react'
import { AlertCircle, Loader2, RefreshCw, Wallet } from 'lucide-react'

import { ListPaginationBar } from '@/components/list-pagination-bar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMemberAccountQuery } from '@/hooks/use-member-account-query'
import { useMemberPaymentHistoryQuery } from '@/hooks/use-member-payment-history-query'
import { BILLING_STATUS_BADGE } from '@/lib/billing-status-badge'
import { formatDatePtBR, formatDateTimePtBR } from '@/lib/utils'

const PAGE_SIZE = 10

function formatBrl(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function MemberAccountPage() {
  const [page, setPage] = useState(1)

  const accountQuery = useMemberAccountQuery()
  const paymentsQuery = useMemberPaymentHistoryQuery(page, PAGE_SIZE)

  const isLoading = accountQuery.isLoading
  const isError = accountQuery.isError
  const account = accountQuery.data

  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Carregando situação da conta">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 py-10">
        <AlertCircle className="size-10 text-destructive" aria-hidden />
        <div className="space-y-1 text-center">
          <p className="font-medium">Não foi possível carregar a situação da conta</p>
          <p className="text-sm text-muted-foreground">{accountQuery.error?.message}</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void accountQuery.refetch()}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (!account) {
    return null
  }

  const statusInfo = BILLING_STATUS_BADGE[account.status]
  const payments = paymentsQuery.data?.payments ?? []
  const totalPages = paymentsQuery.data?.totalPages ?? 0
  const totalElements = paymentsQuery.data?.totalElements ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">Situação da conta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acompanhe o status da sua mensalidade e o histórico de pagamentos conferidos pelo
          administrador.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wallet className="size-5 text-muted-foreground" aria-hidden />
                Mensalidade
              </CardTitle>
              <CardDescription>
                Status recalculado automaticamente conforme o vencimento.
              </CardDescription>
            </div>
            <Badge variant="default" className={statusInfo.className}>
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Próximo vencimento
            </p>
            <p className="mt-1 font-medium">{formatDatePtBR(account.nextDueDate) || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Valor da mensalidade
            </p>
            <p className="mt-1 font-medium">{formatBrl(account.monthlyFeeAmount)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Dia de cobrança
            </p>
            <p className="mt-1 font-medium">Dia {account.billingDay}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de pagamentos</CardTitle>
          <CardDescription>
            Pagamentos registrados pelo administrador após conferência.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentsQuery.isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {paymentsQuery.isError && (
            <div className="flex flex-col items-start gap-3 rounded-md border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-sm text-destructive">{paymentsQuery.error?.message}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void paymentsQuery.refetch()}
              >
                <RefreshCw className="size-3.5" aria-hidden />
                Tentar novamente
              </Button>
            </div>
          )}

          {!paymentsQuery.isLoading && !paymentsQuery.isError && payments.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum pagamento registrado ainda.
            </p>
          )}

          {!paymentsQuery.isLoading && !paymentsQuery.isError && payments.length > 0 && (
            <>
              <div
                className={paymentsQuery.isFetching ? 'pointer-events-none opacity-60' : undefined}
                aria-busy={paymentsQuery.isFetching ? true : undefined}
              >
                {paymentsQuery.isFetching && !paymentsQuery.isLoading ? (
                  <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Atualizando...
                  </div>
                ) : null}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data de conferência</TableHead>
                      <TableHead>Administrador</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Observação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="whitespace-nowrap text-sm">
                          {formatDateTimePtBR(payment.conferenceAt ?? '') || '—'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {payment.adminName ?? '—'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {payment.amount != null ? formatBrl(payment.amount) : '—'}
                        </TableCell>
                        <TableCell className="max-w-[240px] truncate text-sm text-muted-foreground">
                          {payment.note ?? '—'}
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
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
