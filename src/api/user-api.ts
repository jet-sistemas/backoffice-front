import { api } from '@/lib/axios'
import type {
  PaginatedUsersResponse,
  UserListParams,
  UserWithSponsorCreateDTO,
} from '@/types/user'

export const userApi = {
  getUsers(params: UserListParams) {
    return api.get<PaginatedUsersResponse>('/v1/admin/user', { params })
  },

  createUser(data: UserWithSponsorCreateDTO) {
    return api.post('/v1/admin/user', data)
  },
}
