import { useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { useCreateUserWithSponsorMutation } from '@/hooks/use-create-user-with-sponsor-mutation'
import {
  sponsorCreateFormSchema,
  type SponsorCreateFormData,
} from '@/schemas/sponsor-create-schema'
import type { EntityTypeEnum, SponsorPersonaEnum, SponsorTierEnum } from '@/types/user'
import {
  clearSponsorCreateFormDraft,
  getSponsorCreateFormEmptyValues,
  loadSponsorCreateFormDraft,
  saveSponsorCreateFormDraft,
} from '@/lib/sponsor-create-form-draft'
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

export function SponsorCreatePage() {
  const { mutate, isPending } = useCreateUserWithSponsorMutation()

  const draftDefaultValues = useMemo(() => loadSponsorCreateFormDraft(), [])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<SponsorCreateFormData>({
    resolver: zodResolver(sponsorCreateFormSchema),
    defaultValues: draftDefaultValues,
  })

  const entityType = watch('entityType')

  useEffect(() => {
    if (entityType !== 'PERSON') {
      setValue('persona', undefined)
      clearErrors('persona')
    }
  }, [entityType, setValue, clearErrors])

  useEffect(() => {
    const subscription = watch((values) => {
      saveSponsorCreateFormDraft(values as SponsorCreateFormData)
    })
    return () => subscription.unsubscribe()
  }, [watch])

  function onSubmit(data: SponsorCreateFormData) {
    mutate(data, {
      onSuccess: () => {
        clearSponsorCreateFormDraft()
      },
    })
  }

  function handleClearForm() {
    reset(getSponsorCreateFormEmptyValues())
    clearErrors()
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
            Novo patrocinador
          </h1>
          <p className="text-sm text-muted-foreground">
            Cadastro vinculado a um usuário do tipo patrocinador. Após criar, você será
            direcionado à edição para enviar logo e avatar (R2). A senha temporária
            padrão é definida pelo sistema (ex.: temp@1234).
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Conta de acesso</CardTitle>
            <CardDescription>
              Dados do usuário utilizados para login e identificação na plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
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
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                autoComplete="name"
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
              <Label htmlFor="document">CPF ou CNPJ</Label>
              <Controller
                name="document"
                control={control}
                render={({ field }) => (
                  <Input
                    id="document"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={18}
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
              <Label htmlFor="code">Código único (5 caracteres)</Label>
              <Input
                id="code"
                maxLength={5}
                autoComplete="off"
                className="font-mono uppercase"
                aria-invalid={Boolean(errors.code)}
                aria-describedby="code-hint"
                {...register('code')}
              />
              <p id="code-hint" className="text-xs text-muted-foreground">
                Código único de 5 caracteres, usado em validações e identificação.
              </p>
              {errors.code && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.code.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Patrocínio</CardTitle>
            <CardDescription>
              Informações públicas e classificação do patrocinador.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="publicName">Nome público</Label>
              <Input
                id="publicName"
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
              <Label htmlFor="tier-select">Tier</Label>
              <Controller
                name="tier"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="tier-select"
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
              <Label htmlFor="entity-select">Tipo de entidade</Label>
              <Controller
                name="entityType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="entity-select"
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
                <Label htmlFor="persona-select">Persona</Label>
                <Controller
                  name="persona"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(v) => field.onChange(v as SponsorPersonaEnum)}
                    >
                      <SelectTrigger
                        id="persona-select"
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
            <div className="space-y-2">
              <Label htmlFor="site">Site (opcional)</Label>
              <Input id="site" placeholder="https://..." {...register('site')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram (opcional)</Label>
              <Input id="instagram" placeholder="@perfil ou URL" {...register('instagram')} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
              <Input id="whatsapp" placeholder="Telefone ou link" {...register('whatsapp')} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleClearForm}
            >
              Limpar formulário
            </Button>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" className="w-full sm:w-auto" asChild>
                <Link to="/admin/patrocinadores">Cancelar</Link>
              </Button>
              <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Salvando…
                  </>
                ) : (
                  'Criar patrocinador'
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
