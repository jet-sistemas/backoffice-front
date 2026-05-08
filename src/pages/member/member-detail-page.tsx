import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMemberQuery } from '@/hooks/use-member-query'

interface MemberDetailPageProps {
  memberId: string
}

export function MemberDetailPage({ memberId }: MemberDetailPageProps) {
  const parsedId = Number.parseInt(memberId, 10)
  const validId = Number.isFinite(parsedId) && parsedId > 0 ? parsedId : null
  const { data, isLoading, isError, error } = useMemberQuery(validId)

  if (validId == null) {
    return <p>Identificador de membro inválido.</p>
  }

  if (isLoading) return <p>Carregando associado...</p>
  if (isError) return <p>{error?.message ?? 'Erro ao carregar associado.'}</p>
  if (data == null) return <p>Associado não encontrado.</p>

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-bold tracking-tight">Detalhe do associado</h1>
        <Button variant="outline" asChild>
          <Link to="/admin/associados">Voltar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>{data.fullname}</CardTitle></CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <p><strong>E-mail:</strong> {data.email}</p>
          <p><strong>Documento:</strong> {data.document}</p>
          <p><strong>Código:</strong> {data.code}</p>
          <p><strong>WhatsApp:</strong> {data.whatsapp}</p>
          <p><strong>Tipo:</strong> {data.type}</p>
          <p><strong>Status:</strong> {data.active ? 'Ativo' : 'Inativo'}</p>
        </CardContent>
      </Card>
    </div>
  )
}
