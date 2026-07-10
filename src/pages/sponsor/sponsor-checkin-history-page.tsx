import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertCircle } from 'lucide-react'

import { ListPaginationBar } from '@/components/list-pagination-bar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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

const PAGE_SIZE = 10

export function SponsorCheckinHistoryPage() {
  const [page, setPage] = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const listQuery = useSponsorCheckinListQuery({
    page,
    size: PAGE_SIZE,
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
  })

  const rows = listQuery.data?.data ?? []
  const totalPages = listQuery.data?.totalPages ?? 0
  const totalElements = listQuery.data?.totalElements ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Histórico</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Check-ins realizados pela sua empresa.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="startDate">De</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endDate">Até</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value)
              setPage(1)
            }}
          />
        </div>
      </div>

      {listQuery.isError && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{listQuery.error.message}</p>
        </div>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/hora</TableHead>
              <TableHead>Membro</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Duplicado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listQuery.isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {!listQuery.isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  Nenhum check-in encontrado.
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(row.createdAt), 'dd/MM/yyyy HH:mm', {
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell>{row.member.name}</TableCell>
                <TableCell className="font-mono">{row.member.code}</TableCell>
                <TableCell>{row.member.documentMasked}</TableCell>
                <TableCell>
                  <Badge variant={row.validated ? 'default' : 'secondary'}>
                    {row.validated ? 'Validado' : 'Não validado'}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[12rem] truncate text-muted-foreground">
                  {row.reason ?? '—'}
                </TableCell>
                <TableCell>{row.duplicateConfirmed ? 'Sim' : 'Não'}</TableCell>
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
    </div>
  )
}
