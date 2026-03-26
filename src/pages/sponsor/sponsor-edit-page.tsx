import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { useUpdateUserWithSponsorMutation } from '@/hooks/use-update-user-with-sponsor-mutation'
import { useUserWithSponsorQuery } from '@/hooks/use-user-with-sponsor-query'
import { userWithSponsorToEditForm } from '@/lib/user-to-sponsor-edit-form'
import {
  sponsorEditFormSchema,
  type SponsorEditFormData,
} from '@/schemas/sponsor-edit-schema'
import type { EntityTypeEnum, SponsorPersonaEnum, SponsorTierEnum } from '@/types/user'
import { formatCpfCnpjInput } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const TIER_LABELS: Record<SponsorTierEnum, string> = {
  OURO: 'Ouro',
  PRATA: 'Prata',
  BRONZE: 'Bronze',
}

const ENTITY_LABELS: Record<EntityTypeEnum, string> = {
  PERSON: 'Pessoa física',
  COMPANY: 'Pessoa jurídica',
  GOVERNMENT: 'Órgão público',
  NGO: 'ONG',
}

const PERSONA_LABELS: Record<SponsorPersonaEnum, string> = {
  POLITICIAN: 'Político',
  INFLUENCER: 'Influenciador',
  ATHLETE: 'Atleta',
  OTHER: 'Outro',
}

const EDIT_FORM_DEFAULTS: SponsorEditFormData = {
  email: '',
  name: '',
  document: '',
  publicName: '',
  tier: 'BRONZE',
  entityType: 'COMPANY',
  persona: undefined,
  logoUrl: undefined,
  site: undefined,
  instagram: undefined,
  whatsapp: undefined,
}

interface SponsorEditPageProps {
  userId: string
}

export function SponsorEditPage({ userId }: SponsorEditPageProps) {
  const parsedId = Number.parseInt(userId, 10)
  const validId = Number.isFinite(parsedId) && parsedId > 0 ? parsedId : null

  const { data, isLoading, isError, error, refetch } = useUserWithSponsorQuery(validId)
  const { mutate, isPending } = useUpdateUserWithSponsorMutation()
  const [formHydrated, setFormHydrated] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<SponsorEditFormData>({
    resolver: zodResolver(sponsorEditFormSchema),
    defaultValues: EDIT_FORM_DEFAULTS,
  })

  const entityType = watch('entityType')

  useEffect(() => {
    if (entityType !== 'PERSON') {
      setValue('persona', undefined)
      clearErrors('persona')
    }
  }, [entityType, setValue, clearErrors])

  useEffect(() => {
    if (data == null) {
      setFormHydrated(false)
      return
    }
    const mapped = userWithSponsorToEditForm(data)
    if (mapped != null) {
      reset(mapped)
      setFormHydrated(true)
    } else {
      setFormHydrated(false)
    }
  }, [data, reset])

  const formReady =
    validId != null &&
    data != null &&
    data.type === 'SPONSOR' &&
    data.sponsor != null
  const formDisabled = !formReady || !formHydrated
  const showLoadingBanner = validId != null && isLoading
  const wrongKind =
    data != null && (data.type !== 'SPONSOR' || data.sponsor == null)

  function onSubmit(formData: SponsorEditFormData) {
    if (validId == null) return
    mutate({ userId: validId, values: formData })
  }

  if (validId == null) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Button variant="ghost" size="sm" className="-ml-3 w-fit gap-1" asChild>
          <Link to="/admin/patrocinadores">
            <ArrowLeft className="size-4" aria-hidden />
            Voltar à lista
          </Link>
        </Button>
        <div
          className="flex flex-col items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 py-10"
          role="alert"
        >
          <AlertCircle className="size-10 text-destructive" aria-hidden />
          <p className="text-center font-medium">Identificador inválido</p>
          <p className="text-center text-sm text-muted-foreground">
            O link de edição não contém um ID de usuário válido.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="-ml-3 w-fit gap-1" asChild>
            <Link to="/admin/patrocinadores">
              <ArrowLeft className="size-4" aria-hidden />
              Voltar à lista
            </Link>
          </Button>
          <h1 className="font-serif text-2xl font-bold tracking-tight">
            Editar patrocinador
          </h1>
          <p className="text-sm text-muted-foreground">
            Atualize os dados da conta e do patrocínio. O código único não pode ser
            alterado por esta tela. Upload de logo e foto de perfil (R2) não está
            disponível nesta versão.
          </p>
        </div>
      </div>

      {showLoadingBanner && (
        <div
          className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm shadow-sm"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="size-5 shrink-0 animate-spin text-primary" aria-hidden />
          <span>Carregando dados do patrocinador…</span>
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 py-10">
          <AlertCircle className="size-10 text-destructive" />
          <div className="text-center">
            <p className="font-medium">Não foi possível carregar o patrocinador</p>
            <p className="text-sm text-muted-foreground">
              {error?.message ?? 'Tente novamente mais tarde.'}
            </p>
          </div>
          <Button variant="outline" type="button" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {wrongKind && !isError && (
        <div
          className="flex flex-col items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 py-10"
          role="alert"
        >
          <AlertCircle className="size-10 text-destructive" aria-hidden />
          <p className="text-center font-medium">Usuário não é um patrocinador</p>
          <p className="text-center text-sm text-muted-foreground">
            Este registro não possui dados de patrocinador para edição.
          </p>
          <Button variant="outline" asChild>
            <Link to="/admin/patrocinadores">Voltar à lista</Link>
          </Button>
        </div>
      )}

      {!isError && !wrongKind && (
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
        aria-busy={showLoadingBanner}
      >
        <Card className={showLoadingBanner ? 'opacity-80' : undefined}>
          <CardHeader>
            <CardTitle className="font-serif">Conta de acesso</CardTitle>
            <CardDescription>
              Dados do usuário utilizados para login e identificação na plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-email">E-mail</Label>
              <Input
                id="edit-email"
                type="email"
                autoComplete="email"
                disabled={formDisabled}
                aria-invalid={Boolean(errors.email)}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome completo</Label>
              <Input
                id="edit-name"
                autoComplete="name"
                disabled={formDisabled}
                aria-invalid={Boolean(errors.name)}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-document">CPF ou CNPJ</Label>
              <Controller
                name="document"
                control={control}
                render={({ field }) => (
                  <Input
                    id="edit-document"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={18}
                    disabled={formDisabled}
                    aria-invalid={Boolean(errors.document)}
                    value={field.value}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    onChange={(e) => field.onChange(formatCpfCnpjInput(e.target.value))}
                  />
                )}
              />
              {errors.document && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.document.message}
                </p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-code">Código único (somente leitura)</Label>
              <Input
                id="edit-code"
                readOnly
                disabled
                className="font-mono uppercase bg-muted/50"
                value={data?.code ?? ''}
                aria-describedby="edit-code-hint"
              />
              <p id="edit-code-hint" className="text-xs text-muted-foreground">
                O código de 5 caracteres não pode ser alterado nesta tela.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={showLoadingBanner ? 'opacity-80' : undefined}>
          <CardHeader>
            <CardTitle className="font-serif">Patrocínio</CardTitle>
            <CardDescription>
              Informações públicas e classificação do patrocinador.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-publicName">Nome público</Label>
              <Input
                id="edit-publicName"
                disabled={formDisabled}
                aria-invalid={Boolean(errors.publicName)}
                {...register('publicName')}
              />
              {errors.publicName && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.publicName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tier-select">Tier</Label>
              <Controller
                name="tier"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={formDisabled}
                  >
                    <SelectTrigger
                      id="edit-tier-select"
                      aria-invalid={Boolean(errors.tier)}
                      className="w-full"
                    >
                      <SelectValue placeholder="Tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(TIER_LABELS) as SponsorTierEnum[]).map((k) => (
                        <SelectItem key={k} value={k}>
                          {TIER_LABELS[k]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.tier && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.tier.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-entity-select">Tipo de entidade</Label>
              <Controller
                name="entityType"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={formDisabled}
                  >
                    <SelectTrigger
                      id="edit-entity-select"
                      aria-invalid={Boolean(errors.entityType)}
                      className="w-full"
                    >
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ENTITY_LABELS) as EntityTypeEnum[]).map((k) => (
                        <SelectItem key={k} value={k}>
                          {ENTITY_LABELS[k]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.entityType && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.entityType.message}
                </p>
              )}
            </div>
            {entityType === 'PERSON' && (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit-persona-select">Persona</Label>
                <Controller
                  name="persona"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(v) => field.onChange(v as SponsorPersonaEnum)}
                      disabled={formDisabled}
                    >
                      <SelectTrigger
                        id="edit-persona-select"
                        aria-invalid={Boolean(errors.persona)}
                        className="w-full"
                      >
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(PERSONA_LABELS) as SponsorPersonaEnum[]).map(
                          (k) => (
                            <SelectItem key={k} value={k}>
                              {PERSONA_LABELS[k]}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.persona && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.persona.message}
                  </p>
                )}
              </div>
            )}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-logoUrl">URL da logo (opcional)</Label>
              <Input
                id="edit-logoUrl"
                placeholder="https://..."
                disabled={formDisabled}
                aria-invalid={Boolean(errors.logoUrl)}
                {...register('logoUrl')}
              />
              {errors.logoUrl && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.logoUrl.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-site">Site (opcional)</Label>
              <Input
                id="edit-site"
                placeholder="https://..."
                disabled={formDisabled}
                {...register('site')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-instagram">Instagram (opcional)</Label>
              <Input
                id="edit-instagram"
                placeholder="@perfil ou URL"
                disabled={formDisabled}
                {...register('instagram')}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-whatsapp">WhatsApp (opcional)</Label>
              <Input
                id="edit-whatsapp"
                placeholder="Telefone ou link"
                disabled={formDisabled}
                {...register('whatsapp')}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" className="w-full sm:w-auto" asChild>
                <Link to="/admin/patrocinadores">Cancelar</Link>
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={formDisabled || isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Salvando…
                  </>
                ) : (
                  'Salvar alterações'
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
      )}
    </div>
  )
}
