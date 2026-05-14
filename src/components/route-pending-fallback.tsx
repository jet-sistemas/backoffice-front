import { Skeleton } from '@/components/ui/skeleton'

export function RoutePendingFallback() {
  return (
    <div className="flex flex-col gap-4 p-1" aria-busy="true" aria-label="Carregando">
      <Skeleton className="h-9 w-64 max-w-full" />
      <Skeleton className="h-[min(24rem,50vh)] w-full rounded-md" />
    </div>
  )
}
