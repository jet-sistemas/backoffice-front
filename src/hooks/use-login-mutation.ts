import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { authApi } from '@/api/auth-api'
import { useAuth } from '@/contexts/auth-context'
import { getApiErrorMessage } from '@/lib/api-error'
import { resolvePostAuthPath } from '@/lib/post-login-path'
import type { AuthCreateDTO } from '@/types/auth'

export function useLoginMutation() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: AuthCreateDTO) => authApi.login(data),
    onSuccess: async (response) => {
      const accessToken = response.data.data?.accessToken
      if (!accessToken) {
        toast.error('Resposta inválida do servidor.')
        return
      }
      signIn(accessToken)

      try {
        const me = await authApi.getMe()
        const user = me.data.data
        if (user?.mustChangePassword) {
          toast.success('Login realizado. Troque sua senha para continuar.')
        } else {
          toast.success('Login realizado com sucesso.')
        }
        navigate({ to: resolvePostAuthPath(user), replace: true })
      } catch {
        toast.error('Não foi possível carregar os dados da sua conta.')
        navigate({ to: '/login', replace: true })
      }
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
