import { api } from '@/lib/axios'
import type {
  EnvelopeMemberDTO,
  MemberCreateDTO,
  MemberListParams,
  PaginatedMembersResponse,
} from '@/types/member'

export const memberApi = {
  getMembers(params: MemberListParams) {
    const trimmedSearch = params.search?.trim()
    return api.get<PaginatedMembersResponse>('/v1/admin/member', {
      params: {
        ...params,
        search: trimmedSearch != null && trimmedSearch !== '' ? trimmedSearch : undefined,
      },
    })
  },

  createMember(body: MemberCreateDTO) {
    return api.post<EnvelopeMemberDTO>('/v1/admin/member', body)
  },

  getMemberById(id: number) {
    return api.get<EnvelopeMemberDTO>(`/v1/admin/member/${id}`)
  },
}
