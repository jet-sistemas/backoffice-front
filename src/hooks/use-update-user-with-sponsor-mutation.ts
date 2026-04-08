import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { toast } from 'sonner'

import { userApi } from '@/api/user-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { SponsorEditFormData } from '@/schemas/sponsor-edit-schema'
import type { SponsorPersonaEnum, UserWithSponsorUpdateDTO } from '@/types/user'

function buildUpdatePayload(values: SponsorEditFormData): UserWithSponsorUpdateDTO {
  const documentDigits = values.document.replace(/\D/g, '')
  const sponsor: UserWithSponsorUpdateDTO['sponsor'] = {
    publicName: values.publicName.trim(),
    tier: values.tier,
    entityType: values.entityType,
    ...(values.entityType === 'PERSON' && values.persona != null
      ? { persona: values.persona }
      : {}),
    ...(values.logoUrl != null ? { logoUrl: values.logoUrl } : {}),
    ...(values.site != null ? { site: values.site } : {}),
    ...(values.instagram != null ? { instagram: values.instagram } : {}),
    ...(values.whatsapp != null ? { whatsapp: values.whatsapp } : {}),
  }

  return {
    email: values.email.trim(),
    name: values.name.trim(),
    document: documentDigits.length > 0 ? documentDigits : values.document.trim(),
    ...(values.avatarUrl != null ? { avatarUrl: values.avatarUrl } : {}),
    sponsor,
  }
}

export function useUpdateUserWithSponsorMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({
      userId,
      values,
    }: {
      userId: number
      values: SponsorEditFormData
    }) => userApi.updateUser(userId, buildUpdatePayload(values)),
    onSuccess: (_data, { userId }) => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      void queryClient.invalidateQueries({ queryKey: ['user', userId] })
      toast.success('Patrocinador atualizado com sucesso.')
      void navigate({ to: '/admin/patrocinadores' })
    },
    onError: (error) => {
      const fallback =
        error instanceof AxiosError && error.response?.status === 400
          ? 'Verifique os dados informados.'
          : 'Não foi possível atualizar o patrocinador. Tente novamente.'
      toast.error(getApiErrorMessage(error, fallback))
    },
  })
}
