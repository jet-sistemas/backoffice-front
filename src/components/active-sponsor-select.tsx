import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useActiveSponsorOptionsPaginatedQuery } from "@/hooks/use-active-sponsor-options-paginated-query";
import type { ActiveSponsorOption } from "@/hooks/use-active-sponsor-options-paginated-query";
import { cn } from "@/lib/utils";
import type { SponsorMinDTO } from "@/types/benefit";
import type { SponsorTierEnum } from "@/types/user";

const NONE_VALUE = "__none__";

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

function SponsorOptionLabel({ option }: { option: ActiveSponsorOption }) {
  return (
    <span className="flex w-full min-w-0 max-w-full items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "size-2 shrink-0 rounded-full",
              option.isActive
                ? "bg-green-600 dark:bg-green-500"
                : "bg-red-600 dark:bg-red-500",
            )}
            aria-label={
              option.isActive ? "Patrocinador ativo" : "Patrocinador inativo"
            }
          />
        </TooltipTrigger>
        <TooltipContent side="right">
          {option.isActive ? "Ativo" : "Inativo"}
        </TooltipContent>
      </Tooltip>
      <span className="min-w-0 truncate">{option.publicName}</span>
      <Badge
        variant={TIER_BADGE_VARIANT[option.tier]}
        className="ml-auto shrink-0"
      >
        {TIER_LABELS[option.tier]}
      </Badge>
    </span>
  );
}

export interface ActiveSponsorSelectProps {
  id?: string;
  value: number | null;
  onChange: (sponsorId: number | null) => void;
  disabled?: boolean;
  fallbackOption?: Pick<
    SponsorMinDTO,
    "id" | "publicName" | "tier" | "isActive"
  > | null;
  "aria-invalid"?: boolean;
}

export function ActiveSponsorSelect({
  id,
  value,
  onChange,
  disabled,
  fallbackOption,
  "aria-invalid": ariaInvalid,
}: ActiveSponsorSelectProps) {
  const [listPage, setListPage] = useState(1);
  const { data, isLoading, isError, error, refetch } =
    useActiveSponsorOptionsPaginatedQuery(listPage);

  const sponsors = data?.sponsors ?? [];
  const totalPages = Math.max(data?.totalPages ?? 0, 1);

  const selectItems = useMemo((): ActiveSponsorOption[] => {
    const ids = new Set(sponsors.map((s) => s.id));
    const extra: ActiveSponsorOption[] =
      value != null &&
      fallbackOption != null &&
      fallbackOption.id === value &&
      !ids.has(fallbackOption.id)
        ? [
            {
              id: fallbackOption.id,
              publicName: fallbackOption.publicName,
              tier: fallbackOption.tier,
              isActive: fallbackOption.isActive,
            },
          ]
        : [];
    return [...extra, ...sponsors];
  }, [sponsors, value, fallbackOption]);

  const stringValue = value == null ? NONE_VALUE : String(value);

  const handleValueChange = (v: string) => {
    if (v === NONE_VALUE) {
      onChange(null);
      return;
    }
    const n = Number(v);
    if (!Number.isFinite(n)) return;
    onChange(n);
  };

  if (isLoading && data == null) {
    return <Skeleton className="h-9 w-full" aria-hidden />;
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "Não foi possível carregar patrocinadores."}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => refetch()}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-2">
        <Select
          value={stringValue}
          onValueChange={handleValueChange}
          disabled={disabled}
        >
          <SelectTrigger
            id={id}
            className="w-full"
            aria-invalid={ariaInvalid}
            aria-busy={isLoading}
          >
            <SelectValue placeholder="Patrocinador (opcional)" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            className="w-(--radix-select-trigger-width)"
          >
            <SelectItem value={NONE_VALUE}>
              Benefício geral (sem patrocinador)
            </SelectItem>
            {selectItems.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                <SponsorOptionLabel option={s} />
              </SelectItem>
            ))}
            <div
              className="flex items-center justify-between gap-1 border-t p-1"
              onPointerDown={(e) => e.preventDefault()}
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 shrink-0 px-2"
                disabled={listPage <= 1}
                aria-label="Página anterior de patrocinadores"
                onClick={() => setListPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-xs text-muted-foreground tabular-nums">
                Pág. {listPage}/{totalPages}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 shrink-0 px-2"
                disabled={listPage >= totalPages}
                aria-label="Próxima página de patrocinadores"
                onClick={() => setListPage((p) => p + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </SelectContent>
        </Select>
      </div>
    </TooltipProvider>
  );
}
