import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import { userApi } from '@/api/user-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { MemberCreateDTO } from '@/types/member'

export function useCreateMemberMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: MemberCreateDTO) => userApi.createUser(body),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: ['members'] })
      const id = response.data.data?.id
      toast.success('Membro criado com sucesso.')
      if (id != null) {
        void navigate({
          to: '/admin/associados/$userId',
          params: { userId: String(id) },
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
