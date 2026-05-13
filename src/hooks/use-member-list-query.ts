import { useQuery } from '@tanstack/react-query'

import { userApi } from '@/api/user-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { MemberListParams, PaginatedMembersResponse } from '@/types/member'

export function useMemberListQuery(params: MemberListParams) {
  return useQuery({
    queryKey: ['members', params],
    queryFn: async () => {
      try {
        const response = await userApi.getUsers({
          type: 'MEMBER',
          memberType: params.type,
          isActive: params.isActive,
          search: params.search,
          page: params.page,
          size: params.size,
        })
        const envelope = response.data
        const members = (envelope.data ?? [])
          .map((u) => u.member)
          .filter((m): m is NonNullable<typeof m> => m != null)
        return {
          ...envelope,
          data: members,
        } as PaginatedMembersResponse
      } catch (error) {
        throw new Error(getApiErrorMessage(error))
      }
    },
  })
}
