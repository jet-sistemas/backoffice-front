import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Search,
  TriangleAlert,
  UserRound,
} from 'lucide-react'

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
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
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

interface DataFieldProps {
  label: string
  value: React.ReactNode
}

function DataField({ label, value }: DataFieldProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

export function SponsorCheckinPage() {
  const [input, setInput] = useState('')
  const [lookup, setLookup] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [lastResult, setLastResult] = useState<SponsorCheckinDTO | null>(null)

  const previewQuery = useSponsorMemberPreviewQuery(lookup)
  const createMutation = useCreateSponsorCheckinMutation()

  const preview = previewQuery.data
  const isIdle = !lookup && !preview && !previewQuery.isFetching && !previewQuery.isError

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
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Check-in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Busque o membro por código (5 caracteres) ou CPF.
        </p>
      </div>

      <Card>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="lookup">Código ou CPF</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="lookup"
                  value={input}
                  onChange={(e) => setInput(formatLookupInput(e.target.value))}
                  placeholder="Ex.: A1B2C ou 000.000.000-00"
                  autoComplete="off"
                  className="pl-9"
                />
              </div>
            </div>
            <Button type="submit" disabled={previewQuery.isFetching}>
              <Search className="size-4" />
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      {isIdle && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-muted-foreground">
          <UserRound className="size-8 opacity-50" />
          <p className="text-sm">Busque um membro para iniciar o check-in.</p>
        </div>
      )}

      {previewQuery.isFetching && (
        <Card>
          <CardContent className="flex items-start gap-4">
            <Skeleton className="size-16 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      )}

      {previewQuery.isError && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{previewQuery.error.message}</p>
        </div>
      )}

      {preview && !previewQuery.isFetching && (
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="size-16 shrink-0 rounded-full object-cover ring-1 ring-border"
                />
              ) : (
                <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-muted ring-1 ring-border">
                  <UserRound className="size-7 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-semibold">{preview.name}</h2>
                  <Badge
                    className={cn(
                      preview.eligible
                        ? 'border-transparent bg-emerald-600 text-white hover:bg-emerald-600/90'
                        : 'border-transparent bg-destructive text-white hover:bg-destructive/90',
                    )}
                  >
                    {preview.eligible ? 'Apto' : 'Não apto'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {memberTypeLabel(preview.memberType)}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3 text-sm">
              <DataField label="Código" value={<span className="font-mono">{preview.code}</span>} />
              <DataField label="CPF" value={preview.documentMasked} />
            </div>

            {!preview.eligible && preview.ineligibleReason && (
              <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {preview.ineligibleReason}
              </p>
            )}

            {preview.alreadyCheckedInToday && preview.lastCheckinAt && (
              <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
                <Clock3 className="mt-0.5 size-4 shrink-0" />
                <p>
                  Check-in já realizado hoje às{' '}
                  {format(new Date(preview.lastCheckinAt), "HH:mm 'de' dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                  . Confirme para registrar outro.
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter>
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
          </CardFooter>
        </Card>
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
          {lastResult.validated ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          ) : (
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
          )}
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
