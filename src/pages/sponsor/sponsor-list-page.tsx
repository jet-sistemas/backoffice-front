import { useEffect, useState } from "react";
import {
  AlertCircle,
  Building2,
  Eye,
  EyeClosed,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

import { ListPaginationBar } from "@/components/list-pagination-bar";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useActivateUserMutation } from "@/hooks/use-activate-user-mutation";
import { useDeactivateUserMutation } from "@/hooks/use-deactivate-user-mutation";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useUserListQuery } from "@/hooks/use-user-list-query";
import { resolveR2PublicUrl } from "@/lib/r2-public-url";
import { cn, formatDocument, uniqueById } from "@/lib/utils";
import type {
  EntityTypeEnum,
  SponsorPersonaEnum,
  SponsorTierEnum,
  UserWithSponsorDTO,
} from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  tableRowInactiveClassName,
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

const ENTITY_LABELS: Record<EntityTypeEnum, string> = {
  PERSON: "Pessoa física",
  COMPANY: "Pessoa jurídica",
  GOVERNMENT: "Órgão público",
  NGO: "ONG",
};

const PERSONA_LABELS: Record<SponsorPersonaEnum, string> = {
  POLITICIAN: "Político",
  INFLUENCER: "Influenciador",
  ATHLETE: "Atleta",
  OTHER: "Outro",
};

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 500;

export function SponsorListPage() {
  const [page, setPage] = useState(1);
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("ALL");
  const [personaFilter, setPersonaFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, SEARCH_DEBOUNCE_MS);
  const searchQuery =
    debouncedSearch.trim() !== "" ? debouncedSearch.trim() : undefined;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] =
    useState<UserWithSponsorDTO | null>(null);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [userToActivate, setUserToActivate] =
    useState<UserWithSponsorDTO | null>(null);

  const deactivateMutation = useDeactivateUserMutation();
  const activateMutation = useActivateUserMutation();
  const toggleMutationPending =
    deactivateMutation.isPending || activateMutation.isPending;

  const { data, isLoading, isError, error, refetch } = useUserListQuery({
    type: "SPONSOR",
    tier: tierFilter !== "ALL" ? (tierFilter as SponsorTierEnum) : undefined,
    entityType:
      entityTypeFilter !== "ALL"
        ? (entityTypeFilter as EntityTypeEnum)
        : undefined,
    persona:
      entityTypeFilter === "PERSON" && personaFilter !== "ALL"
        ? (personaFilter as SponsorPersonaEnum)
        : undefined,
    isActive: statusFilter !== "ALL" ? statusFilter === "ACTIVE" : undefined,
    search: searchQuery,
    page,
    size: PAGE_SIZE,
  });

  const sponsors = uniqueById(data?.data ?? []);
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const closeDeactivateDialog = () => {
    setDeactivateDialogOpen(false);
    setUserToDeactivate(null);
  };

  const handleDeactivate = (user: UserWithSponsorDTO) => {
    setUserToDeactivate(user);
    setDeactivateDialogOpen(true);
  };

  const confirmDeactivate = () => {
    if (userToDeactivate == null) return;
    deactivateMutation.mutate(userToDeactivate.id, {
      onSuccess: () => closeDeactivateDialog(),
    });
  };

  const closeActivateDialog = () => {
    setActivateDialogOpen(false);
    setUserToActivate(null);
  };

  const handleActivate = (user: UserWithSponsorDTO) => {
    setUserToActivate(user);
    setActivateDialogOpen(true);
  };

  const confirmActivate = () => {
    if (userToActivate == null) return;
    activateMutation.mutate(userToActivate.id, {
      onSuccess: () => closeActivateDialog(),
    });
  };

  const sponsorLabel = (user: UserWithSponsorDTO) =>
    user.sponsor?.publicName ?? user.name;

  const hasActiveServerFilters =
    tierFilter !== "ALL" ||
    entityTypeFilter !== "ALL" ||
    personaFilter !== "ALL" ||
    statusFilter !== "ALL";

  const hasActiveSearch =
    debouncedSearch.trim().length > 0 || searchTerm.trim().length > 0;

  const clearAllFilters = () => {
    setSearchTerm("");
    setTierFilter("ALL");
    setEntityTypeFilter("ALL");
    setPersonaFilter("ALL");
    setStatusFilter("ALL");
    setPage(1);
  };

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
        <Button asChild>
          <Link to="/admin/patrocinadores/novo">
            <Plus />
            Novo patrocinador
          </Link>
        </Button>
      </div>

      <section
        aria-labelledby="sponsor-filters-heading"
        className="rounded-lg border bg-card p-4 shadow-sm"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2
              id="sponsor-filters-heading"
              className="text-sm font-semibold leading-none"
            >
              Filtrar e buscar
            </h2>
            <p className="max-w-2xl text-xs text-muted-foreground">
              Filtros e busca refinam a lista no servidor (paginação coerente
              com o resultado).
            </p>
          </div>
          {(hasActiveServerFilters || hasActiveSearch) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 self-start text-muted-foreground"
              onClick={clearAllFilters}
            >
              Limpar tudo
            </Button>
          )}
        </div>

        <div className="mt-4 space-y-4">
          <div className="max-w-xl space-y-2">
            <Label htmlFor="sponsor-search">Buscar patrocinadores</Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="sponsor-search"
                placeholder="Nome público, nome da conta, documento ou código…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div
            className={`grid gap-4 sm:grid-cols-2 ${entityTypeFilter === "PERSON" ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
          >
          <div className="space-y-2">
            <Label htmlFor="sponsor-filter-tier">Tier de patrocínio</Label>
            <Select
              value={tierFilter}
              onValueChange={(v) => {
                setTierFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger id="sponsor-filter-tier" className="w-full">
                <SelectValue placeholder="Selecione o tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os tiers</SelectItem>
                <SelectItem value="OURO">Ouro</SelectItem>
                <SelectItem value="PRATA">Prata</SelectItem>
                <SelectItem value="BRONZE">Bronze</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sponsor-filter-entity">Tipo de entidade</Label>
            <Select
              value={entityTypeFilter}
              onValueChange={(v) => {
                setEntityTypeFilter(v);
                if (v !== "PERSON") setPersonaFilter("ALL");
                setPage(1);
              }}
            >
              <SelectTrigger id="sponsor-filter-entity" className="w-full">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os tipos</SelectItem>
                {(Object.keys(ENTITY_LABELS) as EntityTypeEnum[]).map(
                  (key) => (
                    <SelectItem key={key} value={key}>
                      {ENTITY_LABELS[key]}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          {entityTypeFilter === "PERSON" && (
            <div className="space-y-2">
              <Label htmlFor="sponsor-filter-persona">Perfil da pessoa</Label>
              <Select
                value={personaFilter}
                onValueChange={(v) => {
                  setPersonaFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger id="sponsor-filter-persona" className="w-full">
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os perfis</SelectItem>
                  {(Object.keys(PERSONA_LABELS) as SponsorPersonaEnum[]).map(
                    (key) => (
                      <SelectItem key={key} value={key}>
                        {PERSONA_LABELS[key]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="sponsor-filter-status">Situação da conta</Label>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger id="sponsor-filter-status" className="w-full">
                <SelectValue placeholder="Selecione a situação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                <SelectItem value="ACTIVE">Ativa</SelectItem>
                <SelectItem value="INACTIVE">Inativa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          </div>
        </div>
      </section>

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

      {!isLoading && !isError && sponsors.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Building2 className="size-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Nenhum patrocinador encontrado</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery ||
              tierFilter !== "ALL" ||
              entityTypeFilter !== "ALL" ||
              personaFilter !== "ALL" ||
              statusFilter !== "ALL"
                ? "Tente ajustar os filtros da busca."
                : "Comece adicionando o primeiro patrocinador."}
            </p>
          </div>
        </div>
      )}

      {!isLoading && !isError && sponsors.length > 0 && (
        <>
          <div className="rounded-lg border bg-card">
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
                  <TableHead className="min-w-[140px] text-right">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sponsors.map((user) => {
                  const logoSrc = resolveR2PublicUrl(user.sponsor?.logoUrl);
                  const inactive = !user.accountActive;
                  return (
                    <TableRow
                      key={user.id}
                      className={cn(inactive && tableRowInactiveClassName)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {logoSrc ? (
                            <img
                              src={logoSrc}
                              alt={user.sponsor?.publicName ?? user.name}
                              className={cn(
                                "size-8 rounded-md object-cover",
                                inactive && "opacity-80",
                              )}
                            />
                          ) : (
                            <div
                              className={cn(
                                "flex size-8 items-center justify-center rounded-md bg-blue-50",
                                inactive && "bg-neutral-200",
                              )}
                            >
                              <Building2
                                className={cn(
                                  "size-4 text-blue-400",
                                  inactive && "text-neutral-500",
                                )}
                              />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p
                              className={cn(
                                "truncate font-medium",
                                inactive && "font-thin text-neutral-600",
                              )}
                            >
                              {user.sponsor?.publicName ?? user.name}
                            </p>
                            <p
                              className={cn(
                                "truncate text-xs text-muted-foreground",
                                inactive && "text-neutral-400",
                              )}
                            >
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "hidden sm:table-cell",
                          inactive && "text-neutral-500",
                        )}
                      >
                        {formatDocument(user.document)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span
                          className={cn(
                            "text-sm text-muted-foreground",
                            inactive && "text-neutral-400",
                          )}
                        >
                          {user.sponsor?.entityType != null
                            ? ENTITY_LABELS[user.sponsor.entityType]
                            : "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.sponsor?.tier && (
                          <Badge
                            variant={TIER_BADGE_VARIANT[user.sponsor.tier]}
                            className={cn(inactive && "opacity-90 bg-neutral-200 text-neutral-500")}
                          >
                            {TIER_LABELS[user.sponsor.tier]}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.accountActive ? (
                          <Badge
                            variant="default"
                            className="bg-emerald-600 text-white hover:bg-emerald-600/90"
                          >
                            Ativo
                          </Badge>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-neutral-50 px-2 py-0.5 text-[11px] font-bold text-neutral-500">
                            {/* <span
                              className="size-1.5 shrink-0 rounded-full bg-neutral-400"
                              aria-hidden
                            /> */}
                            Inativo
                          </span>
                        )}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "hidden md:table-cell",
                          inactive && "text-neutral-500",
                        )}
                      >
                        <code
                          className={cn(
                            "rounded bg-blue-50 px-1.5 py-0.5 text-xs",
                            !inactive && "font-bold",
                            inactive && "bg-neutral-100 text-neutral-500",
                          )}
                        >
                          {user.code}
                        </code>
                      </TableCell>
                      <TableCell className="text-right">
                        <div
                          className={cn(
                            "flex justify-end gap-1",
                            inactive && "opacity-80",
                          )}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "size-9",
                              inactive &&
                                "border border-neutral-200 bg-neutral-50 hover:bg-neutral-100/80",
                            )}
                            asChild
                          >
                            <Link
                              to="/admin/patrocinadores/$userId/editar"
                              params={{ userId: String(user.id) }}
                              aria-label={`Editar patrocinador ${sponsorLabel(user)}`}
                            >
                              <Pencil className="size-4" aria-hidden />
                            </Link>
                          </Button>
                          {user.accountActive ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-9 text-destructive hover:text-accent-foreground"
                              aria-label={`Desativar patrocinador ${sponsorLabel(user)}`}
                              disabled={toggleMutationPending}
                              onClick={() => handleDeactivate(user)}
                            >
                              <EyeClosed className="size-4" aria-hidden />
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-9 text-sky-600 dark:text-sky-400 hover:text-accent-foreground"
                              aria-label={`Ativar patrocinador ${sponsorLabel(user)}`}
                              disabled={toggleMutationPending}
                              onClick={() => handleActivate(user)}
                            >
                              <Eye className="size-4" aria-hidden />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-9 text-muted-foreground"
                            aria-label={`Apagar patrocinador ${sponsorLabel(user)} (indisponível)`}
                            disabled
                            title="Apagar registro em breve"
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <ListPaginationBar
            page={page}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            totalElements={totalElements}
            entityPlural="patrocinadores"
            onPageChange={setPage}
          />
        </>
      )}

      <AlertDialog
        open={deactivateDialogOpen}
        onOpenChange={(open) => {
          if (open) return;
          if (toggleMutationPending) return;
          closeDeactivateDialog();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">
              Desativar patrocinador?
            </AlertDialogTitle>
            <AlertDialogDescription>
              O patrocinador{" "}
              <span className="font-medium text-foreground">
                &quot;
                {userToDeactivate ? sponsorLabel(userToDeactivate) : ""}&quot;
              </span>{" "}
              será desativado de forma lógica: a conta deixa de poder iniciar
              sessão, o patrocinador passa a inativo e os benefícios associados
              a ele são desativados. O registro permanece na base de dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={toggleMutationPending}>
              Cancelar
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deactivateMutation.isPending}
              onClick={confirmDeactivate}
            >
              {deactivateMutation.isPending ? "Desativando…" : "Desativar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={activateDialogOpen}
        onOpenChange={(open) => {
          if (open) return;
          if (toggleMutationPending) return;
          closeActivateDialog();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">
              Ativar patrocinador?
            </AlertDialogTitle>
            <AlertDialogDescription>
              A conta do patrocinador{" "}
              <span className="font-medium text-foreground">
                &quot;
                {userToActivate ? sponsorLabel(userToActivate) : ""}&quot;
              </span>{" "}
              será reativada: volta a poder iniciar sessão, o registro de
              patrocinador e os benefícios associados a esse patrocinador
              voltam a ficar ativos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={toggleMutationPending}>
              Cancelar
            </AlertDialogCancel>
            <Button
              type="button"
              disabled={activateMutation.isPending}
              onClick={confirmActivate}
            >
              {activateMutation.isPending ? "Ativando…" : "Ativar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SponsorTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome público</TableHead>
              <TableHead className="hidden sm:table-cell">Tipo</TableHead>
              <TableHead>Tier</TableHead>
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
  );
}
