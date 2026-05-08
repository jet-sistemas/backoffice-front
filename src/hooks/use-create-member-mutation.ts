import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import { memberApi } from '@/api/member-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { MemberCreateDTO } from '@/types/member'

export function useCreateMemberMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: MemberCreateDTO) => memberApi.createMember(body),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: ['members'] })
      const id = response.data.data?.id
      toast.success('Membro criado com sucesso.')
      if (id != null) {
        void navigate({
          to: '/admin/associados/$memberId',
          params: { memberId: String(id) },
        })
      } else {
        void navigate({ to: '/admin/associados' })
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Não foi possível criar o membro.'))
    },
  })
}
