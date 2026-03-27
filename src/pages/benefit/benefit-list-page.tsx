import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  AlertCircle,
  Ban,
  Building2,
  Gift,
  Pencil,
  RefreshCw,
} from "lucide-react";

import { ActiveSponsorSelect } from "@/components/active-sponsor-select";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useBenefitListQuery } from "@/hooks/use-benefit-list-query";
import { useCreateBenefitMutation } from "@/hooks/use-create-benefit-mutation";
import { useDeactivateBenefitMutation } from "@/hooks/use-deactivate-benefit-mutation";
import { useUpdateBenefitMutation } from "@/hooks/use-update-benefit-mutation";
import { uniqueById } from "@/lib/utils";
import {
  benefitFormSchema,
  BENEFIT_DESCRIPTION_MAX_LENGTH,
  type BenefitFormData,
} from "@/schemas/benefit-form-schema";
import type { BenefitDTO } from "@/types/benefit";
import type { SponsorTierEnum } from "@/types/user";

const PAGE_SIZE = 10;

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

function mapStatusFilter(v: string): boolean | undefined {
  if (v === "ALL") return undefined;
  if (v === "ACTIVE") return true;
  return false;
}

export function BenefitListPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<BenefitDTO | null>(null);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [benefitToDeactivate, setBenefitToDeactivate] =
    useState<BenefitDTO | null>(null);

  const isActiveParam = mapStatusFilter(statusFilter);

  const { data, isLoading, isError, error, refetch } = useBenefitListQuery({
    page,
    size: PAGE_SIZE,
    ...(isActiveParam !== undefined ? { isActive: isActiveParam } : {}),
  });

  const createMutation = useCreateBenefitMutation();
  const updateMutation = useUpdateBenefitMutation();
  const deactivateMutation = useDeactivateBenefitMutation();

  const benefits = uniqueById(data?.data ?? []);
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const createForm = useForm<BenefitFormData>({
    resolver: zodResolver(benefitFormSchema),
    defaultValues: {
      name: "",
      description: undefined,
      address: undefined,
      sponsorId: null,
    },
  });

  const editForm = useForm<BenefitFormData>({
    resolver: zodResolver(benefitFormSchema),
    defaultValues: {
      name: "",
      description: undefined,
      address: undefined,
      sponsorId: null,
    },
  });

  useEffect(() => {
    if (editing == null) return;
    editForm.reset({
      name: editing.name,
      description: editing.description,
      address: editing.address,
      sponsorId: editing.sponsor?.id ?? null,
    });
  }, [editing, editForm]);

  const onCreateSubmit = createForm.handleSubmit((values) => {
    createMutation.mutate(
      {
        name: values.name,
        description: values.description,
        address: values.address,
        sponsorId: values.sponsorId,
      },
      {
        onSuccess: () => {
          createForm.reset({
            name: "",
            description: undefined,
            address: undefined,
            sponsorId: null,
          });
        },
      },
    );
  });

  const onEditSubmit = editForm.handleSubmit((values) => {
    if (editing == null) return;
    updateMutation.mutate(
      {
        id: editing.id,
        body: {
          name: values.name,
          description: values.description,
          address: values.address,
          sponsorId: values.sponsorId,
        },
      },
      {
        onSuccess: () => {
          setEditOpen(false);
          setEditing(null);
        },
      },
    );
  });

  const closeDeactivateDialog = () => {
    setDeactivateDialogOpen(false);
    setBenefitToDeactivate(null);
  };

  const handleDeactivate = (b: BenefitDTO) => {
    setBenefitToDeactivate(b);
    setDeactivateDialogOpen(true);
  };

  const confirmDeactivate = () => {
    if (benefitToDeactivate == null) return;
    deactivateMutation.mutate(benefitToDeactivate.id, {
      onSuccess: () => closeDeactivateDialog(),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          Benefícios
        </h1>
        <p className="text-sm text-muted-foreground">
          Cadastre benefícios da associação e vincule-os a patrocinadores quando
          necessário
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,360px)_1fr] lg:items-start">
        <Card className="lg:sticky lg:top-4">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Novo benefício</CardTitle>
            <CardDescription>
              Preencha os dados. O patrocinador é opcional; pode associar depois
              ao editar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onCreateSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="benefit-name">Nome</Label>
                <Input
                  id="benefit-name"
                  {...createForm.register("name")}
                  aria-invalid={createForm.formState.errors.name != null}
                  placeholder="Ex.: Desconto na loja parceira"
                />
                {createForm.formState.errors.name != null ? (
                  <p className="text-sm text-destructive">
                    {createForm.formState.errors.name.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="benefit-description">Descrição</Label>
                  <span
                    className="text-xs text-muted-foreground tabular-nums"
                    aria-live="polite"
                  >
                    {(createForm.watch("description") ?? "").length} /{" "}
                    {BENEFIT_DESCRIPTION_MAX_LENGTH}
                  </span>
                </div>
                <textarea
                  id="benefit-description"
                  maxLength={BENEFIT_DESCRIPTION_MAX_LENGTH}
                  className="border-input bg-background ring-ring/50 flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                  {...createForm.register("description")}
                  aria-invalid={createForm.formState.errors.description != null}
                  placeholder="Detalhes do benefício"
                />
                {createForm.formState.errors.description != null ? (
                  <p className="text-sm text-destructive">
                    {createForm.formState.errors.description.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="benefit-address">Endereço</Label>
                <Input
                  id="benefit-address"
                  {...createForm.register("address")}
                  placeholder="Onde utilizar (se aplicável)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="benefit-sponsor">Patrocinador</Label>
                <Controller
                  control={createForm.control}
                  name="sponsorId"
                  render={({ field }) => (
                    <ActiveSponsorSelect
                      id="benefit-sponsor"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={createMutation.isPending}
                      aria-invalid={
                        createForm.formState.errors.sponsorId != null
                      }
                    />
                  )}
                />
                {createForm.formState.errors.sponsorId != null ? (
                  <p className="text-sm text-destructive">
                    {createForm.formState.errors.sponsorId.message}
                  </p>
                ) : null}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Salvando…" : "Criar benefício"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="min-w-0 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger
                className="w-full sm:w-48"
                aria-label="Filtrar por estado do benefício"
              >
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="ACTIVE">Ativos</SelectItem>
                <SelectItem value="INACTIVE">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading && <BenefitTableSkeleton />}

          {isError && (
            <div className="flex flex-col items-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 py-12">
              <AlertCircle className="size-10 text-destructive" />
              <div className="text-center">
                <p className="font-medium">Erro ao carregar benefícios</p>
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

          {!isLoading && !isError && benefits.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                <Gift className="size-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Nenhum benefício encontrado</p>
                <p className="text-sm text-muted-foreground">
                  {statusFilter !== "ALL"
                    ? "Tente ajustar o filtro de estado."
                    : "Crie o primeiro benefício ao lado."}
                </p>
              </div>
            </div>
          )}

          {!isLoading && !isError && benefits.length > 0 && (
            <>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="hidden md:table-cell max-w-[200px]">
                        Descrição
                      </TableHead>
                      <TableHead className="hidden lg:table-cell max-w-[180px]">
                        Endereço
                      </TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="min-w-[140px]">
                        Patrocinador
                      </TableHead>
                      <TableHead className="w-[100px] text-right">
                        <span className="sr-only">Ações</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {benefits.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.name}</TableCell>
                        <TableCell
                          className="hidden max-w-[200px] md:table-cell"
                          title={b.description}
                        >
                          <span className="line-clamp-2 text-sm text-muted-foreground">
                            {b.description ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell
                          className="hidden max-w-[180px] lg:table-cell"
                          title={b.address}
                        >
                          <span className="line-clamp-2 text-sm text-muted-foreground">
                            {b.address ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={b.isActive ? "default" : "outline"}
                            className={
                              b.isActive
                                ? "bg-emerald-600 text-white hover:bg-emerald-600/90"
                                : ""
                            }
                          >
                            {b.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {b.sponsor != null ? (
                            <div className="flex flex-col gap-1">
                              <span className="flex items-center gap-1.5 text-sm font-medium">
                                <Building2
                                  className="size-3.5 shrink-0 text-muted-foreground"
                                  aria-hidden
                                />
                                <span className="truncate">
                                  {b.sponsor.publicName}
                                </span>
                              </span>
                              <div className="flex flex-wrap items-center gap-1">
                                <Badge
                                  variant={TIER_BADGE_VARIANT[b.sponsor.tier]}
                                >
                                  {TIER_LABELS[b.sponsor.tier]}
                                </Badge>
                                {!b.sponsor.isActive ? (
                                  <Badge variant="outline" className="text-xs">
                                    Patroc. inativo
                                  </Badge>
                                ) : null}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Geral (associação)
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-9"
                              aria-label={`Editar benefício ${b.name}`}
                              onClick={() => {
                                setEditing(b);
                                setEditOpen(true);
                              }}
                            >
                              <Pencil className="size-4" aria-hidden />
                            </Button>
                            {b.isActive ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-9 text-destructive hover:text-destructive"
                                aria-label={`Desativar benefício ${b.name}`}
                                disabled={deactivateMutation.isPending}
                                onClick={() => handleDeactivate(b)}
                              >
                                <Ban className="size-4" aria-hidden />
                              </Button>
                            ) : null}
                          </div>
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
                {totalElements} benefício{totalElements !== 1 ? "s" : ""}{" "}
                encontrado{totalElements !== 1 ? "s" : ""}
              </ListPaginationBar>
            </>
          )}
        </div>
      </div>

      <AlertDialog
        open={deactivateDialogOpen}
        onOpenChange={(open) => {
          if (open) return;
          if (deactivateMutation.isPending) return;
          closeDeactivateDialog();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">
              Desativar benefício?
            </AlertDialogTitle>
            <AlertDialogDescription>
              O benefício{" "}
              <span className="font-medium text-foreground">
                &quot;{benefitToDeactivate?.name ?? ""}&quot;
              </span>{" "}
              deixará de aparecer como ativo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={deactivateMutation.isPending}>
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

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Editar benefício</DialogTitle>
            <DialogDescription>
              Atualize os dados ou associe / remova o patrocinador.
            </DialogDescription>
          </DialogHeader>
          {editing != null ? (
            <form onSubmit={onEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-benefit-name">Nome</Label>
                <Input
                  id="edit-benefit-name"
                  {...editForm.register("name")}
                  aria-invalid={editForm.formState.errors.name != null}
                />
                {editForm.formState.errors.name != null ? (
                  <p className="text-sm text-destructive">
                    {editForm.formState.errors.name.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="edit-benefit-description">Descrição</Label>
                  <span
                    className="text-xs text-muted-foreground tabular-nums"
                    aria-live="polite"
                  >
                    {(editForm.watch("description") ?? "").length} /{" "}
                    {BENEFIT_DESCRIPTION_MAX_LENGTH}
                  </span>
                </div>
                <textarea
                  id="edit-benefit-description"
                  maxLength={BENEFIT_DESCRIPTION_MAX_LENGTH}
                  className="border-input bg-background ring-ring/50 flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px]"
                  {...editForm.register("description")}
                  aria-invalid={editForm.formState.errors.description != null}
                />
                {editForm.formState.errors.description != null ? (
                  <p className="text-sm text-destructive">
                    {editForm.formState.errors.description.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-benefit-address">Endereço</Label>
                <Input
                  id="edit-benefit-address"
                  {...editForm.register("address")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-benefit-sponsor">Patrocinador</Label>
                <p className="text-xs text-muted-foreground">
                  Escolha &quot;Benefício geral&quot; para remover o vínculo com
                  patrocinador.
                </p>
                <Controller
                  control={editForm.control}
                  name="sponsorId"
                  render={({ field }) => (
                    <ActiveSponsorSelect
                      key={editing.id}
                      id="edit-benefit-sponsor"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={updateMutation.isPending}
                      fallbackOption={editing.sponsor ?? null}
                      aria-invalid={
                        editForm.formState.errors.sponsorId != null
                      }
                    />
                  )}
                />
                {editForm.formState.errors.sponsorId != null ? (
                  <p className="text-sm text-destructive">
                    {editForm.formState.errors.sponsorId.message}
                  </p>
                ) : null}
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditOpen(false);
                    setEditing(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Salvando…" : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BenefitTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Patrocinador</TableHead>
              <TableHead className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="ml-auto h-8 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
