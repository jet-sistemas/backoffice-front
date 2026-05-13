import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertCircle,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from 'lucide-react'

import { ListPaginationBar } from '@/components/list-pagination-bar'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useMemberListQuery } from '@/hooks/use-member-list-query'
import { cn } from '@/lib/utils'
import type { MemberTypeEnum } from '@/types/member'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 500

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

  const members = data?.data ?? []
  const totalPages = data?.totalPages ?? 0
  const totalElements = data?.totalElements ?? 0

  const searchSettling = searchTerm.trim() !== debouncedSearch.trim()
  const listQueryBusy = isLoading || isFetching || searchSettling

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
                placeholder="Nome, e-mail, documento, código ou WhatsApp…"
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
              <Label htmlFor="member-filter-status">Situação</Label>
              <Select
                value={activeFilter}
                onValueChange={(v) => {
                  setActiveFilter(v)
                  setPage(1)
                }}
                disabled={listQueryBusy}
              >
                <SelectTrigger id="member-filter-status" className="w-full">
                  <SelectValue placeholder="Situação" />
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

      {isLoading && (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          Carregando associados…
        </div>
      )}

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

      {!isLoading && !isError && members.length === 0 && (
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

      {!isLoading && !isError && members.length > 0 && (
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
                  <TableHead>E-mail</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">Detalhe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.fullname}</TableCell>
                    <TableCell>{m.email}</TableCell>
                    <TableCell>{m.whatsapp}</TableCell>
                    <TableCell>
                      {m.type === 'SUBSCRIBER' ? 'Assinante' : 'Patrocinado'}
                    </TableCell>
                    <TableCell>{m.active ? 'Ativo' : 'Inativo'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" asChild>
                        <Link
                          to="/admin/associados/$userId"
                          params={{ userId: String(m.userId) }}
                        >
                          Ver
                        </Link>
                      </Button>
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
            entityPlural="associados"
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}
