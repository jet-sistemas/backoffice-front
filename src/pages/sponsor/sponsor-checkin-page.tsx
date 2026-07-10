import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertCircle, CheckCircle2, Search, UserRound } from 'lucide-react'

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
import { useCreateSponsorCheckinMutation } from '@/hooks/use-create-sponsor-checkin-mutation'
import { useSponsorMemberPreviewQuery } from '@/hooks/use-sponsor-member-preview-query'
import { resolveR2PublicUrl } from '@/lib/r2-public-url'
import { cn, formatCPF, removeSpecialCharacters } from '@/lib/utils'
import type { SponsorCheckinDTO } from '@/types/sponsor-checkin'

function formatLookupInput(raw: string): string {
  const digits = removeSpecialCharacters(raw)
  if (digits.length > 0 && digits.length <= 11 && /^\d*$/.test(digits) && raw.replace(/\D/g, '') === digits) {
    if (digits.length <= 11 && (raw.includes('.') || raw.includes('-') || digits.length > 5)) {
      return formatCPF(digits)
    }
  }
  return raw.toUpperCase().slice(0, 14)
}

function memberTypeLabel(type: string) {
  return type === 'SPONSORED' ? 'Patrocinado' : 'Assinante'
}

export function SponsorCheckinPage() {
  const [input, setInput] = useState('')
  const [lookup, setLookup] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [lastResult, setLastResult] = useState<SponsorCheckinDTO | null>(null)

  const previewQuery = useSponsorMemberPreviewQuery(lookup)
  const createMutation = useCreateSponsorCheckinMutation()

  const preview = previewQuery.data

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLastResult(null)
    const trimmed = input.trim()
    if (!trimmed) return
    setLookup(trimmed)
  }

  function submitCheckin(confirmDuplicateToday: boolean) {
    if (!lookup) return
    createMutation.mutate(
      { lookup, confirmDuplicateToday },
      {
        onSuccess: (data) => {
          setLastResult(data)
          setConfirmOpen(false)
          void previewQuery.refetch()
        },
      },
    )
  }

  function handleConfirmClick() {
    if (!preview) return
    if (preview.alreadyCheckedInToday) {
      setConfirmOpen(true)
      return
    }
    submitCheckin(false)
  }

  const avatarUrl = resolveR2PublicUrl(preview?.avatarUrl)

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Check-in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Busque o membro por código (5 caracteres) ou CPF.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="lookup">Código ou CPF</Label>
          <Input
            id="lookup"
            value={input}
            onChange={(e) => setInput(formatLookupInput(e.target.value))}
            placeholder="Ex.: A1B2C ou 000.000.000-00"
            autoComplete="off"
          />
        </div>
        <Button type="submit" className="mt-6" disabled={previewQuery.isFetching}>
          <Search className="size-4" />
          Buscar
        </Button>
      </form>

      {previewQuery.isFetching && (
        <div className="space-y-3 rounded-lg border p-4">
          <Skeleton className="size-16 rounded-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}

      {previewQuery.isError && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{previewQuery.error.message}</p>
        </div>
      )}

      {preview && !previewQuery.isFetching && (
        <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-start gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="size-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                <UserRound className="size-7 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-semibold">{preview.name}</h2>
                <Badge
                  variant={preview.eligible ? 'default' : 'destructive'}
                  className={cn(!preview.eligible && 'bg-destructive')}
                >
                  {preview.eligible ? 'Apto' : 'Não apto'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Código <span className="font-mono text-foreground">{preview.code}</span>
                {' · '}
                {preview.documentMasked}
              </p>
              <p className="text-sm text-muted-foreground">
                {memberTypeLabel(preview.memberType)}
              </p>
              {!preview.eligible && preview.ineligibleReason && (
                <p className="text-sm text-destructive">{preview.ineligibleReason}</p>
              )}
            </div>
          </div>

          {preview.alreadyCheckedInToday && preview.lastCheckinAt && (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
              Check-in já realizado hoje às{' '}
              {format(new Date(preview.lastCheckinAt), "HH:mm 'de' dd/MM/yyyy", {
                locale: ptBR,
              })}
              . Confirme para registrar outro.
            </div>
          )}

          <Button
            type="button"
            className="w-full"
            disabled={createMutation.isPending}
            onClick={handleConfirmClick}
          >
            {preview.alreadyCheckedInToday
              ? 'Confirmar novo check-in'
              : preview.eligible
                ? 'Registrar check-in'
                : 'Registrar tentativa'}
          </Button>
        </div>
      )}

      {lastResult && (
        <div
          className={cn(
            'flex items-start gap-2 rounded-lg border p-3 text-sm',
            lastResult.validated
              ? 'border-emerald-500/40 bg-emerald-500/10'
              : 'border-amber-500/40 bg-amber-500/10',
          )}
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">
              {lastResult.validated
                ? 'Check-in validado'
                : 'Tentativa não validada'}
            </p>
            <p className="text-muted-foreground">
              {format(new Date(lastResult.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
              {lastResult.reason ? ` — ${lastResult.reason}` : ''}
            </p>
          </div>
        </div>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Check-in já realizado hoje</AlertDialogTitle>
            <AlertDialogDescription>
              Já existe um check-in deste membro hoje. Deseja registrar um novo?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={createMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <Button
              type="button"
              disabled={createMutation.isPending}
              onClick={() => submitCheckin(true)}
            >
              Confirmar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
