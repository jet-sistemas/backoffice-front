import { api } from "@/lib/axios";
import { sponsorTierFromApi, sponsorTierToApi } from "@/lib/sponsor-tier";
import type { EnvelopeResendAccountValidationDTO } from "@/types/account-validation";
import type {
  EnvelopeMemberDTO,
  SubscriberMemberPatchDTO,
} from "@/types/member";
import type {
  EnvelopeUserDetailDTO,
  PaginatedUsersResponse,
  UserDetailDTO,
  UserListParams,
  UserWithSponsorCreateDTO,
  UserWithSponsorDTO,
  UserWithSponsorUpdateDTO,
} from "@/types/user";

type UserDetailFromApi = UserDetailDTO & {
  isAccountActive?: boolean;
  sponsor?: (UserWithSponsorDTO["sponsor"] & {
    active?: boolean;
    isActive?: boolean;
  }) | null;
};

function onlyDigits(value: string | undefined | null): string | undefined {
  if (value == null) return undefined;
  const digits = value.replace(/\D/g, "");
  return digits.length > 0 ? digits : undefined;
}

function mapUserDetailFromApi(user: UserDetailFromApi): UserDetailDTO {
  const accountActive = user.accountActive ?? user.isAccountActive ?? false;
  const base = { ...user, accountActive };
  if (user.type !== "SPONSOR" && user.type !== "SPONSOR_MEMBER") {
    return base as UserDetailDTO;
  }
  const sponsor = user.sponsor;
  if (sponsor == null) return base as UserDetailDTO;
  const tier = sponsorTierFromApi(sponsor.tier as unknown as string);
  const isActive = sponsor.isActive ?? sponsor.active ?? true;
  return {
    ...(base as UserWithSponsorDTO),
    sponsor: {
      ...sponsor,
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
            mapUserDetailFromApi(u as UserDetailFromApi),
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
      .post<EnvelopeUserDetailDTO>("/v1/admin/user", payload)
      .then((res) => {
        const envelope = res.data;
        const u = envelope.data;
        if (!u) return res;
        return {
          ...res,
          data: {
            ...envelope,
            data: mapUserDetailFromApi(u as UserDetailFromApi),
          },
        };
      });
  },

  getUserById(id: number) {
    return api
      .get<EnvelopeUserDetailDTO>(`/v1/admin/user/${id}`)
      .then((res) => {
        const envelope = res.data;
        const u = envelope.data;
        if (!u) return res;
        return {
          ...res,
          data: {
            ...envelope,
            data: mapUserDetailFromApi(u as UserDetailFromApi),
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
            whatsapp: onlyDigits(s.whatsapp),
            isActive: s.isActive,
            ...(s.tier != null ? { tier: sponsorTierToApi(s.tier) } : {}),
          };
    const m = data.member;
    const memberBody =
      m == null
        ? undefined
        : {
            fullname: m.fullname,
            whatsapp: onlyDigits(m.whatsapp),
          };
    const payload = {
      email: data.email,
      name: data.name,
      document: onlyDigits(data.document),
      avatarUrl: data.avatarUrl,
      sponsor: sponsorBody,
      member: memberBody,
    };
    return api
      .put<EnvelopeUserDetailDTO>(`/v1/admin/user/${id}`, payload)
      .then((res) => {
        const envelope = res.data;
        const u = envelope.data;
        if (!u) return res;
        return {
          ...res,
          data: {
            ...envelope,
            data: mapUserDetailFromApi(u as UserDetailFromApi),
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

  resendAccountValidation(userId: number) {
    return api.post<EnvelopeResendAccountValidationDTO>(
      `/v1/admin/user/${userId}/resend-account-validation`,
    );
  },
};
