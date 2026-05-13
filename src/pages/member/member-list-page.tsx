import { Link } from '@tanstack/react-router'
import { Plus, Search } from 'lucide-react'
import { useState } from 'react'

import { ListPaginationBar } from '@/components/list-pagination-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useMemberListQuery } from '@/hooks/use-member-list-query'
import type { MemberTypeEnum } from '@/types/member'

const PAGE_SIZE = 10

export function MemberListPage() {
  const [page, setPage] = useState(1)
  const [type, setType] = useState<string>('ALL')
  const [activeFilter, setActiveFilter] = useState<string>('ALL')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 400)

  const isActive =
    activeFilter === 'ACTIVE' ? true : activeFilter === 'INACTIVE' ? false : undefined

  const { data, isLoading } = useMemberListQuery({
    type: type !== 'ALL' ? (type as MemberTypeEnum) : undefined,
    isActive,
    search: debouncedSearch.trim() !== '' ? debouncedSearch : undefined,
    page,
    size: PAGE_SIZE,
  })

  const members = data?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight">Associados</h1>
          <p className="text-sm text-muted-foreground">Gestão de membros da associação</p>
        </div>
        <Button asChild>
          <Link to="/admin/associados/novo">
            <Plus className="size-4" />
            Novo associado
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[220px_220px_1fr]">
        <Select value={type} onValueChange={(v) => { setType(v); setPage(1) }}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo de membro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos os tipos</SelectItem>
            <SelectItem value="SUBSCRIBER">Assinante</SelectItem>
            <SelectItem value="SPONSORED">Patrocinado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={activeFilter} onValueChange={(v) => { setActiveFilter(v); setPage(1) }}>
          <SelectTrigger>
            <SelectValue placeholder="Situação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Ativos e inativos</SelectItem>
            <SelectItem value="ACTIVE">Somente ativos</SelectItem>
            <SelectItem value="INACTIVE">Somente inativos</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail, documento, código ou WhatsApp"
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
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
            {isLoading ? (
              <TableRow><TableCell colSpan={6}>Carregando...</TableCell></TableRow>
            ) : members.length === 0 ? (
              <TableRow><TableCell colSpan={6}>Nenhum associado encontrado.</TableCell></TableRow>
            ) : (
              members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.fullname}</TableCell>
                  <TableCell>{m.email}</TableCell>
                  <TableCell>{m.whatsapp}</TableCell>
                  <TableCell>{m.type === 'SUBSCRIBER' ? 'Assinante' : 'Patrocinado'}</TableCell>
                  <TableCell>{m.active ? 'Ativo' : 'Inativo'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" asChild>
                      <Link to="/admin/associados/$userId" params={{ userId: String(m.userId) }}>
                        Ver
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ListPaginationBar
        page={page}
        totalPages={data?.totalPages ?? 0}
        pageSize={PAGE_SIZE}
        totalElements={data?.totalElements ?? 0}
        entityPlural="associados"
        onPageChange={setPage}
      />
    </div>
  )
}
