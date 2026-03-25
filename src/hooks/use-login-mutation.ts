import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { authApi } from '@/api/auth-api'
import { useAuth } from '@/contexts/auth-context'
import { getApiErrorMessage } from '@/lib/api-error'
import type { AuthCreateDTO } from '@/types/auth'

export function useLoginMutation() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: AuthCreateDTO) => authApi.login(data),
    onSuccess: (response) => {
      const accessToken = response.data.data?.accessToken
      if (!accessToken) {
        toast.error('Resposta inválida do servidor.')
        return
      }
      signIn(accessToken)
      toast.success('Login realizado com sucesso.')
      navigate({ to: '/admin/patrocinadores' })
    },
    onError: (error) => {
      const fallback =
        error instanceof AxiosError && error.response?.status === 400
          ? 'E-mail ou senha inválidos.'
          : 'Não foi possível completar a operação. Tente novamente.'
      toast.error(getApiErrorMessage(error, fallback))
    },
  })
}
