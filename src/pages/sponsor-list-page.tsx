import { useState } from "react";
import { AlertCircle, Building2, Plus, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

import { useUserListQuery } from "@/hooks/use-user-list-query";
import { formatDocument, uniqueById } from "@/lib/utils";
import { ListPaginationBar } from "@/components/list-pagination-bar";
import type { SponsorTierEnum } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TIER_LABELS: Record<SponsorTierEnum, string> = {
  OURO: "Ouro",
  PRATA: "Prata",
  BRONZE: "Bronze",
};

const TIER_BADGE_VARIANT: Record<
  SponsorTierEnum,
  "gold" | "silver" | "bronze"
> = {
  OURO: "gold",
  PRATA: "silver",
  BRONZE: "bronze",
};

const PAGE_SIZE = 10;

export function SponsorListPage() {
  const [page, setPage] = useState(1);
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isError, error, refetch } = useUserListQuery({
    type: "SPONSOR",
    tier: tierFilter !== "ALL" ? (tierFilter as SponsorTierEnum) : undefined,
    isActive: statusFilter !== "ALL" ? statusFilter === "ACTIVE" : undefined,
    page,
    size: PAGE_SIZE,
  });

  const sponsors = uniqueById(data?.data ?? []);
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const filteredSponsors = searchTerm
    ? sponsors.filter(
        (s) =>
          s.sponsor?.publicName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          s.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : sponsors;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight">
            Patrocinadores
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os patrocinadores da associação
          </p>
        </div>
        <Button onClick={() => toast.info("Funcionalidade em breve")}>
          <Plus />
          Novo patrocinador
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            aria-label="Buscar patrocinadores"
          />
        </div>

        <Select
          value={tierFilter}
          onValueChange={(v) => {
            setTierFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger
            className="w-full sm:w-40"
            aria-label="Filtrar por tier"
          >
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos os tiers</SelectItem>
            <SelectItem value="OURO">Ouro</SelectItem>
            <SelectItem value="PRATA">Prata</SelectItem>
            <SelectItem value="BRONZE">Bronze</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger
            className="w-full sm:w-40"
            aria-label="Filtrar por status"
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="ACTIVE">Ativo</SelectItem>
            <SelectItem value="INACTIVE">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && <SponsorTableSkeleton />}

      {isError && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 py-12">
          <AlertCircle className="size-10 text-destructive" />
          <div className="text-center">
            <p className="font-medium">Erro ao carregar patrocinadores</p>
            <p className="text-sm text-muted-foreground">
              {error?.message ?? "Tente novamente mais tarde."}
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw />
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && !isError && filteredSponsors.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Building2 className="size-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Nenhum patrocinador encontrado</p>
            <p className="text-sm text-muted-foreground">
              {searchTerm || tierFilter !== "ALL" || statusFilter !== "ALL"
                ? "Tente ajustar os filtros da busca."
                : "Comece adicionando o primeiro patrocinador."}
            </p>
          </div>
        </div>
      )}

      {!isLoading && !isError && filteredSponsors.length > 0 && (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome público</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Documento
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Código</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSponsors.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {user.sponsor?.logoUrl ? (
                          <img
                            src={user.sponsor.logoUrl}
                            alt={user.sponsor.publicName}
                            className="size-8 rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                            <Building2 className="size-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {user.sponsor?.publicName ?? user.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {formatDocument(user.document)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {user.sponsor?.entityType === "PERSON"
                          ? "Pessoa Física"
                          : "Pessoa Jurídica"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {user.sponsor?.tier && (
                        <Badge variant={TIER_BADGE_VARIANT[user.sponsor.tier]}>
                          {TIER_LABELS[user.sponsor.tier]}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.sponsor?.isActive ? "default" : "outline"}
                        className={
                          user.sponsor?.isActive
                            ? "bg-emerald-600 text-white hover:bg-emerald-600/90"
                            : ""
                        }
                      >
                        {user.sponsor?.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {user.code}
                      </code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ListPaginationBar
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          >
            {totalElements} patrocinador{totalElements !== 1 ? "es" : ""}{" "}
            encontrado{totalElements !== 1 ? "s" : ""}
          </ListPaginationBar>
        </>
      )}
    </div>
  );
}

function SponsorTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome público</TableHead>
              <TableHead className="hidden sm:table-cell">Tipo</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Código</TableHead>
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
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-14 rounded-md" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-12 rounded-md" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-14" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
