import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { userApi } from '@/api/user-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type {
  MemberListParams,
  MemberListRow,
  PaginatedMemberListRowsResponse,
} from '@/types/member'
import { isUserWithMember } from '@/types/user'

export function useMemberListQuery(params: MemberListParams) {
  return useQuery({
    queryKey: ['members', params],
    placeholderData: keepPreviousData,
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
        const rows: MemberListRow[] = (envelope.data ?? [])
          .map((u) => {
            if (!isUserWithMember(u)) return null
            const member = u.member
            if (member == null) return null
            return {
              userId: u.id,
              avatarUrl: u.avatarUrl,
              accountActive: u.accountActive,
              member,
            } satisfies MemberListRow
          })
          .filter((row): row is MemberListRow => row != null)
        return {
          ...envelope,
          data: rows,
        } satisfies PaginatedMemberListRowsResponse
      } catch (error) {
        throw new Error(getApiErrorMessage(error))
      }
    },
  })
}
