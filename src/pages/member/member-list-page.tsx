import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertCircle,
  Eye,
  EyeClosed,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  User,
  Users,
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
  tableRowInactiveClassName,
} from '@/components/ui/table'
import { useActivateUserMutation } from '@/hooks/use-activate-user-mutation'
import { useDeactivateUserMutation } from '@/hooks/use-deactivate-user-mutation'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useMemberListQuery } from '@/hooks/use-member-list-query'
import { resolveR2PublicUrl } from '@/lib/r2-public-url'
import { cn, formatDocument } from '@/lib/utils'
import type { MemberListRow, MemberTypeEnum } from '@/types/member'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 500

const MEMBER_TYPE_LABELS: Record<MemberTypeEnum, string> = {
  SUBSCRIBER: 'Assinante',
  SPONSORED: 'Patrocinado',
}

function memberRowLabel(row: MemberListRow) {
  return row.member.fullname
}

export function MemberListPage() {
  const [page, setPage] = useState(1)
  const [type, setType] = useState<string>('ALL')
  const [activeFilter, setActiveFilter] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedValue(searchTerm, SEARCH_DEBOUNCE_MS)
  const searchQuery =
    debouncedSearch.trim() !== '' ? debouncedSearch.trim() : undefined

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const isActive =
    activeFilter === 'ACTIVE' ? true : activeFilter === 'INACTIVE' ? false : undefined

  const { data, isLoading, isFetching, isError, error, refetch } = useMemberListQuery({
    type: type !== 'ALL' ? (type as MemberTypeEnum) : undefined,
    isActive,
    search: searchQuery,
    page,
    size: PAGE_SIZE,
  })

  const rows = data?.data ?? []
  const totalPages = data?.totalPages ?? 0
  const totalElements = data?.totalElements ?? 0

  const searchSettling = searchTerm.trim() !== debouncedSearch.trim()
  const listQueryBusy = isLoading || isFetching || searchSettling

  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)
  const [rowToDeactivate, setRowToDeactivate] = useState<MemberListRow | null>(null)
  const [activateDialogOpen, setActivateDialogOpen] = useState(false)
  const [rowToActivate, setRowToActivate] = useState<MemberListRow | null>(null)

  const deactivateMutation = useDeactivateUserMutation()
  const activateMutation = useActivateUserMutation()
  const toggleMutationPending =
    deactivateMutation.isPending || activateMutation.isPending

  const closeDeactivateDialog = () => {
    setDeactivateDialogOpen(false)
    setRowToDeactivate(null)
  }

  const handleDeactivate = (row: MemberListRow) => {
    setRowToDeactivate(row)
    setDeactivateDialogOpen(true)
  }

  const confirmDeactivate = () => {
    if (rowToDeactivate == null) return
    deactivateMutation.mutate(rowToDeactivate.userId, {
      onSuccess: () => closeDeactivateDialog(),
    })
  }

  const closeActivateDialog = () => {
    setActivateDialogOpen(false)
    setRowToActivate(null)
  }

  const handleActivate = (row: MemberListRow) => {
    setRowToActivate(row)
    setActivateDialogOpen(true)
  }

  const confirmActivate = () => {
    if (rowToActivate == null) return
    activateMutation.mutate(rowToActivate.userId, {
      onSuccess: () => closeActivateDialog(),
    })
  }

  const hasActiveServerFilters = type !== 'ALL' || activeFilter !== 'ALL'
  const hasActiveSearch =
    debouncedSearch.trim().length > 0 || searchTerm.trim().length > 0

  const clearAllFilters = () => {
    setSearchTerm('')
    setType('ALL')
    setActiveFilter('ALL')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight">Associados</h1>
          <p className="text-sm text-muted-foreground">
            Gestão de membros da associação
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/associados/novo">
            <Plus className="size-4" />
            Novo associado
          </Link>
        </Button>
      </div>

      <section
        aria-labelledby="member-filters-heading"
        className="rounded-lg border bg-card p-4 shadow-sm"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2
              id="member-filters-heading"
              className="text-sm font-semibold leading-none"
            >
              Filtrar e buscar
            </h2>
            <p className="max-w-2xl text-xs text-muted-foreground">
              Filtros refinam no servidor. O texto de busca é enviado à API após uma breve
              pausa na digitação; a paginação reflete o resultado da consulta.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2 self-start sm:flex-row sm:items-center">
            {listQueryBusy && (
              <p
                className="flex items-center gap-2 text-xs text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                <Loader2
                  className="size-4 shrink-0 animate-spin text-muted-foreground"
                  aria-hidden
                />
                Buscando resultados…
              </p>
            )}
            {(hasActiveServerFilters || hasActiveSearch) && !listQueryBusy && (
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

        <div className="mt-4 space-y-4">
          <div className="max-w-xl space-y-2">
            <Label htmlFor="member-search">Buscar associados</Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="member-search"
                placeholder="Buscar por nome, e-mail, documento, código ou WhatsApp…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                disabled={isLoading || isFetching}
                aria-busy={listQueryBusy}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Aguarde um instante após digitar para a lista atualizar no servidor.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="member-filter-type">Tipo de membro</Label>
              <Select
                value={type}
                onValueChange={(v) => {
                  setType(v)
                  setPage(1)
                }}
                disabled={listQueryBusy}
              >
                <SelectTrigger id="member-filter-type" className="w-full">
                  <SelectValue placeholder="Tipo de membro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os tipos</SelectItem>
                  <SelectItem value="SUBSCRIBER">Assinante</SelectItem>
                  <SelectItem value="SPONSORED">Patrocinado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-filter-status">Situação da conta</Label>
              <Select
                value={activeFilter}
                onValueChange={(v) => {
                  setActiveFilter(v)
                  setPage(1)
                }}
                disabled={listQueryBusy}
              >
                <SelectTrigger id="member-filter-status" className="w-full">
                  <SelectValue placeholder="Situação da conta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Ativos e inativos</SelectItem>
                  <SelectItem value="ACTIVE">Somente ativos</SelectItem>
                  <SelectItem value="INACTIVE">Somente inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {isLoading && <MemberTableSkeleton />}

      {isError && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 py-12">
          <AlertCircle className="size-10 text-destructive" />
          <div className="text-center">
            <p className="font-medium">Erro ao carregar associados</p>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Tente novamente mais tarde.'}
            </p>
          </div>
          <Button variant="outline" disabled={listQueryBusy} onClick={() => void refetch()}>
            <RefreshCw />
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && !isError && rows.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Users className="size-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Nenhum associado encontrado</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery || hasActiveServerFilters
                ? 'Tente ajustar os filtros da busca.'
                : 'Comece adicionando o primeiro associado.'}
            </p>
          </div>
        </div>
      )}

      {!isLoading && !isError && rows.length > 0 && (
        <>
          <div
            className={cn(
              'rounded-lg border bg-card transition-opacity',
              listQueryBusy && 'pointer-events-none opacity-55',
            )}
            aria-busy={listQueryBusy}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden sm:table-cell">Documento</TableHead>
                  <TableHead className="hidden lg:table-cell">WhatsApp</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Código</TableHead>
                  <TableHead className="min-w-[140px] text-right">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const m = row.member
                  const avatarSrc = resolveR2PublicUrl(row.avatarUrl)
                  const inactive = !row.accountActive
                  const typeVariant = m.type === 'SUBSCRIBER' ? 'gold' : 'accent'
                  return (
                    <TableRow
                      key={row.userId}
                      className={cn(inactive && tableRowInactiveClassName)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {avatarSrc ? (
                            <img
                              src={avatarSrc}
                              alt={m.fullname}
                              className={cn(
                                'size-8 rounded-md object-cover',
                                inactive && 'opacity-80',
                              )}
                            />
                          ) : (
                            <div
                              role="img"
                              aria-label="Sem foto de perfil"
                              className={cn(
                                'flex size-8 items-center justify-center rounded-md bg-blue-50',
                                inactive && 'bg-neutral-200',
                              )}
                            >
                              <User
                                className={cn(
                                  'size-4 text-blue-400',
                                  inactive && 'text-neutral-500',
                                )}
                                aria-hidden
                              />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p
                              className={cn(
                                'truncate font-medium',
                                inactive && 'font-thin text-neutral-600',
                              )}
                            >
                              {m.fullname}
                            </p>
                            <p
                              className={cn(
                                'truncate text-xs text-muted-foreground',
                                inactive && 'text-neutral-400',
                              )}
                            >
                              {m.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell
                        className={cn(
                          'hidden sm:table-cell',
                          inactive && 'text-neutral-500',
                        )}
                      >
                        {formatDocument(m.document)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'hidden lg:table-cell',
                          inactive && 'text-neutral-500',
                        )}
                      >
                        {m.whatsapp}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={typeVariant}
                          className={cn(
                            m.type === 'SUBSCRIBER' &&
                              !inactive &&
                              'text-amber-950 [a&]:hover:bg-jet-gold/90',
                            inactive &&
                              'opacity-90 bg-neutral-200 text-neutral-500 border-neutral-200',
                          )}
                        >
                          {MEMBER_TYPE_LABELS[m.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {row.accountActive ? (
                          <Badge
                            variant="default"
                            className="bg-emerald-600 text-white hover:bg-emerald-600/90"
                          >
                            Ativo
                          </Badge>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-neutral-50 px-2 py-0.5 text-[11px] font-bold text-neutral-500">
                            Inativo
                          </span>
                        )}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'hidden md:table-cell',
                          inactive && 'text-neutral-500',
                        )}
                      >
                        <code
                          className={cn(
                            'rounded bg-blue-50 px-1.5 py-0.5 text-xs',
                            !inactive && 'font-bold',
                            inactive && 'bg-neutral-100 text-neutral-500',
                          )}
                        >
                          {m.code}
                        </code>
                      </TableCell>
                      <TableCell className="text-right">
                        <div
                          className={cn(
                            'flex justify-end gap-1',
                            inactive && 'opacity-80',
                          )}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              'size-9',
                              inactive &&
                                'border border-neutral-200 bg-neutral-50 hover:bg-neutral-100/80',
                            )}
                            asChild
                          >
                            <Link
                              to="/admin/associados/$userId"
                              params={{ userId: String(row.userId) }}
                              aria-label={`Editar associado ${memberRowLabel(row)}`}
                            >
                              <Pencil className="size-4" aria-hidden />
                            </Link>
                          </Button>
                          {row.accountActive ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-9 text-destructive hover:text-accent-foreground"
                              aria-label={`Desativar associado ${memberRowLabel(row)}`}
                              disabled={toggleMutationPending}
                              onClick={() => handleDeactivate(row)}
                            >
                              <EyeClosed className="size-4" aria-hidden />
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-9 text-sky-600 dark:text-sky-400 hover:text-accent-foreground"
                              aria-label={`Ativar associado ${memberRowLabel(row)}`}
                              disabled={toggleMutationPending}
                              onClick={() => handleActivate(row)}
                            >
                              <Eye className="size-4" aria-hidden />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-9 text-muted-foreground"
                            aria-label={`Apagar associado ${memberRowLabel(row)} (indisponível)`}
                            disabled
                            title="Apagar registro em breve"
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <ListPaginationBar
            page={page}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            totalElements={totalElements}
            entityPlural="associados"
            onPageChange={setPage}
            disabled={listQueryBusy}
          />
        </>
      )}

      <AlertDialog
        open={deactivateDialogOpen}
        onOpenChange={(open) => {
          if (open) return
          if (toggleMutationPending) return
          closeDeactivateDialog()
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Desativar associado?</AlertDialogTitle>
            <AlertDialogDescription>
              O associado{' '}
              <span className="font-medium text-foreground">
                &quot;{rowToDeactivate ? memberRowLabel(rowToDeactivate) : ''}&quot;
              </span>{' '}
              será desativado de forma lógica: a conta deixa de poder iniciar sessão e o
              registro de membro passa a inativo. O registro permanece na base de dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={toggleMutationPending}>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deactivateMutation.isPending}
              onClick={confirmDeactivate}
            >
              {deactivateMutation.isPending ? 'Desativando…' : 'Desativar'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={activateDialogOpen}
        onOpenChange={(open) => {
          if (open) return
          if (toggleMutationPending) return
          closeActivateDialog()
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Ativar associado?</AlertDialogTitle>
            <AlertDialogDescription>
              A conta do associado{' '}
              <span className="font-medium text-foreground">
                &quot;{rowToActivate ? memberRowLabel(rowToActivate) : ''}&quot;
              </span>{' '}
              será reativada: volta a poder iniciar sessão e o registro de membro volta a
              ficar ativo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={toggleMutationPending}>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              disabled={activateMutation.isPending}
              onClick={confirmActivate}
            >
              {activateMutation.isPending ? 'Ativando…' : 'Ativar'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function MemberTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">Documento</TableHead>
              <TableHead className="hidden lg:table-cell">WhatsApp</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Código</TableHead>
              <TableHead className="min-w-[140px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-md" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-md" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-12 rounded-md" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-14" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Skeleton className="size-9 rounded-md" />
                    <Skeleton className="size-9 rounded-md" />
                    <Skeleton className="size-9 rounded-md" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
