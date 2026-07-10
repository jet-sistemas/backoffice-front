import { AlertCircle, Loader2 } from 'lucide-react'

import { MemberCard } from '@/components/member-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useMemberCardQuery } from '@/hooks/use-member-card-query'

export function MemberCardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useMemberCardQuery()

  if (isLoading) {
    return (
      <div
        className="mx-auto w-full max-w-xs space-y-4"
        aria-busy="true"
        aria-label="Carregando carteirinha"
      >
        <div className="overflow-hidden rounded-3xl border shadow-xl">
          <Skeleton className="h-2 w-full rounded-none" />
          <div className="space-y-6 px-7 pt-6 pb-8">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-3 w-8" />
            </div>
            <div className="flex justify-center">
              <Skeleton className="size-24 rounded-full" />
            </div>
            <div className="space-y-2 text-center">
              <Skeleton className="mx-auto h-6 w-40" />
              <Skeleton className="mx-auto h-3 w-32" />
            </div>
            <Skeleton className="h-px w-full" />
            <div className="space-y-5">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
          <Skeleton className="h-2 w-full rounded-none" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto flex max-w-xs flex-col items-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 py-10">
        <AlertCircle className="size-10 text-destructive" aria-hidden />
        <div className="space-y-1 text-center">
          <p className="font-medium">Não foi possível carregar a carteirinha</p>
          <p className="text-sm text-muted-foreground">{error?.message}</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void refetch()}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="space-y-6" aria-busy={isFetching}>
      <div className="text-center">
        <h1 className="font-serif text-2xl font-bold tracking-tight">Minha carteirinha</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Apresente esta carteirinha para identificação nos benefícios da associação.
        </p>
      </div>

      {isFetching && !isLoading ? (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Atualizando...
        </div>
      ) : null}

      <MemberCard card={data} />
    </div>
  )
}
