import { api } from "@/lib/axios";
import { sponsorTierFromApi, sponsorTierToApi } from "@/lib/sponsor-tier";
import type {
  EnvelopeMemberDTO,
  SubscriberMemberPatchDTO,
} from "@/types/member";
import type {
  EnvelopeUserWithSponsorDTO,
  PaginatedUsersResponse,
  UserListParams,
  UserWithSponsorCreateDTO,
  UserWithSponsorDTO,
  UserWithSponsorUpdateDTO,
} from "@/types/user";

interface UserWithSponsorDTOFromApi extends Omit<
  UserWithSponsorDTO,
  "sponsor"
> {
  sponsor?: UserWithSponsorDTO["sponsor"] & {
    active?: boolean;
    isActive?: boolean;
  };
}

function mapUserWithSponsorFromApi(
  user: UserWithSponsorDTOFromApi,
): UserWithSponsorDTO {
  if (!user.sponsor) return user;
  const tier = sponsorTierFromApi(user.sponsor.tier as unknown as string);
  const isActive = user.sponsor.isActive ?? user.sponsor.active ?? true;

  return {
    ...user,
    sponsor: {
      ...user.sponsor,
      ...(tier != null ? { tier } : {}),
      isActive,
    },
  };
}

export const userApi = {
  getUsers(params: UserListParams) {
    const trimmedSearch = params.search?.trim();
    const apiParams = {
      ...params,
      tier: params.tier != null ? sponsorTierToApi(params.tier) : undefined,
      search:
        trimmedSearch != null && trimmedSearch !== ""
          ? trimmedSearch
          : undefined,
    };
    return api
      .get<PaginatedUsersResponse>("/v1/admin/user", { params: apiParams })
      .then((res) => {
        const envelope = res.data;
        const data =
          envelope.data?.map((u) =>
            mapUserWithSponsorFromApi(u as UserWithSponsorDTOFromApi),
          ) ?? [];
        return { ...res, data: { ...envelope, data } };
      });
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
          };
    return api
      .post<EnvelopeUserWithSponsorDTO>("/v1/admin/user", payload)
      .then((res) => {
        const envelope = res.data;
        const u = envelope.data;
        if (!u) return res;
        return {
          ...res,
          data: {
            ...envelope,
            data: mapUserWithSponsorFromApi(u as UserWithSponsorDTOFromApi),
          },
        };
      });
  },

  getUserById(id: number) {
    return api
      .get<EnvelopeUserWithSponsorDTO>(`/v1/admin/user/${id}`)
      .then((res) => {
        const envelope = res.data;
        const u = envelope.data;
        if (!u) return res;
        return {
          ...res,
          data: {
            ...envelope,
            data: mapUserWithSponsorFromApi(u as UserWithSponsorDTOFromApi),
          },
        };
      });
  },

  updateUser(id: number, data: UserWithSponsorUpdateDTO) {
    const s = data.sponsor;
    const sponsorBody =
      s == null
        ? undefined
        : {
            publicName: s.publicName,
            entityType: s.entityType,
            persona: s.persona,
            logoUrl: s.logoUrl,
            site: s.site,
            instagram: s.instagram,
            whatsapp: s.whatsapp,
            isActive: s.isActive,
            ...(s.tier != null ? { tier: sponsorTierToApi(s.tier) } : {}),
          };
    const payload = {
      email: data.email,
      name: data.name,
      document: data.document,
      avatarUrl: data.avatarUrl,
      sponsor: sponsorBody,
    };
    return api
      .put<EnvelopeUserWithSponsorDTO>(`/v1/admin/user/${id}`, payload)
      .then((res) => {
        const envelope = res.data;
        const u = envelope.data;
        if (!u) return res;
        return {
          ...res,
          data: {
            ...envelope,
            data: mapUserWithSponsorFromApi(u as UserWithSponsorDTOFromApi),
          },
        };
      });
  },

  deactivateUser(id: number) {
    return api.patch(`/v1/admin/user/${id}/deactivate`);
  },

  activateUser(id: number) {
    return api.patch(`/v1/admin/user/${id}/activate`);
  },

  patchSubscriberUser(userId: number, body: SubscriberMemberPatchDTO) {
    return api.patch<EnvelopeMemberDTO>(
      `/v1/admin/user/${userId}/subscriber`,
      body,
    );
  },
};
