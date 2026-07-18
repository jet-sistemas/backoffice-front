import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { sponsorApi } from '@/api/sponsor-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { SponsorCheckinCreateDTO } from '@/types/sponsor-checkin'

export function useCreateSponsorCheckinMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: SponsorCheckinCreateDTO) => {
      const response = await sponsorApi.createCheckin(body)
      return response.data.data
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['sponsor', 'checkins'] })
      void queryClient.invalidateQueries({
        queryKey: ['sponsor', 'member-preview'],
      })
      if (data.validated) {
        toast.success('Check-in registrado com sucesso.')
      } else {
        toast.message('Tentativa registrada (não validada).')
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
    },
  })
}
