import { api } from '@/lib/axios'
import { sponsorTierFromApi, sponsorTierToApi } from '@/lib/sponsor-tier'
import type {
  EnvelopeUserWithSponsorDTO,
  PaginatedUsersResponse,
  UserListParams,
  UserWithSponsorCreateDTO,
  UserWithSponsorDTO,
} from '@/types/user'

function mapUserWithSponsorFromApi(
  user: UserWithSponsorDTO,
): UserWithSponsorDTO {
  if (!user.sponsor) return user
  const tier = sponsorTierFromApi(user.sponsor.tier as unknown as string)
  if (tier == null) return user
  return { ...user, sponsor: { ...user.sponsor, tier } }
}

export const userApi = {
  getUsers(params: UserListParams) {
    const apiParams = {
      ...params,
      tier:
        params.tier != null ? sponsorTierToApi(params.tier) : undefined,
    }
    return api
      .get<PaginatedUsersResponse>('/v1/admin/user', { params: apiParams })
      .then((res) => {
        const envelope = res.data
        const data =
          envelope.data?.map((u) => mapUserWithSponsorFromApi(u)) ?? []
        return { ...res, data: { ...envelope, data } }
      })
  },

  createUser(data: UserWithSponsorCreateDTO) {
    const payload =
      data.sponsor == null
        ? data
        : {
            ...data,
            sponsor: {
              ...data.sponsor,
              tier: sponsorTierToApi(data.sponsor.tier),
            },
          }
    return api
      .post<EnvelopeUserWithSponsorDTO>('/v1/admin/user', payload)
      .then((res) => {
        const envelope = res.data
        const u = envelope.data
        if (!u) return res
        return {
          ...res,
          data: {
            ...envelope,
            data: mapUserWithSponsorFromApi(u),
          },
        }
      })
  },
}
