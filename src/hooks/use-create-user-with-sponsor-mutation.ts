import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { toast } from 'sonner'

import { userApi } from '@/api/user-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { SponsorCreateFormData } from '@/schemas/sponsor-create-schema'
import type { UserWithSponsorCreateDTO } from '@/types/user'

function buildCreatePayload(values: SponsorCreateFormData): UserWithSponsorCreateDTO {
  const documentDigits = values.document.replace(/\D/g, '')
  const sponsor: UserWithSponsorCreateDTO['sponsor'] = {
    publicName: values.publicName.trim(),
    tier: values.tier,
    entityType: values.entityType,
    ...(values.entityType === 'PERSON' && values.persona != null
      ? { persona: values.persona }
      : {}),
    ...(values.site != null ? { site: values.site } : {}),
    ...(values.instagram != null ? { instagram: values.instagram } : {}),
    ...(values.whatsapp != null ? { whatsapp: values.whatsapp } : {}),
  }

  return {
    user: {
      email: values.email.trim(),
      name: values.name.trim(),
      document: documentDigits.length > 0 ? documentDigits : values.document.trim(),
      code: values.code,
      type: 'SPONSOR',
    },
    sponsor,
  }
}

export function useCreateUserWithSponsorMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (values: SponsorCreateFormData) =>
      userApi.createUser(buildCreatePayload(values)),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      const id = response.data?.data?.id
      toast.success(
        'Patrocinador criado. Você pode enviar a logo e o avatar na tela de edição.',
      )
      if (id != null) {
        void navigate({
          to: '/admin/patrocinadores/$userId/editar',
          params: { userId: String(id) },
        })
      } else {
        void navigate({ to: '/admin/patrocinadores' })
      }
    },
    onError: (error) => {
      const fallback =
        error instanceof AxiosError && error.response?.status === 400
          ? 'Verifique os dados informados.'
          : 'Não foi possível criar o patrocinador. Tente novamente.'
      toast.error(getApiErrorMessage(error, fallback))
    },
  })
}
