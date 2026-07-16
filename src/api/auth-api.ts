import { api } from '@/lib/axios'
import type {
  AuthCreateDTO,
  ChangePasswordRequestDTO,
  EnvelopeAuthDTO,
  EnvelopeAuthExtDTO,
} from '@/types/auth'

export const authApi = {
  login(data: AuthCreateDTO) {
    return api.post<EnvelopeAuthDTO>('/v1/auth', data)
  },

  getMe() {
    return api.get<EnvelopeAuthExtDTO>('/v1/auth/me')
  },

  changePassword(data: ChangePasswordRequestDTO) {
    return api.post<EnvelopeAuthExtDTO>('/v1/auth/change-password', data)
  },
}
