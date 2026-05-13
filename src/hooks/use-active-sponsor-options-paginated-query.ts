import { useQuery } from "@tanstack/react-query";

import { userApi } from "@/api/user-api";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  isUserWithSponsor,
  type SponsorTierEnum,
  type UserDetailDTO,
} from "@/types/user";

export const ACTIVE_SPONSOR_OPTIONS_PAGE_SIZE = 30;

export interface ActiveSponsorOption {
  id: number;
  publicName: string;
  tier: SponsorTierEnum;
  isActive: boolean;
}

function mapPageToSponsorOptions(
  users: UserDetailDTO[],
): ActiveSponsorOption[] {
  const bySponsorId = new Map<number, ActiveSponsorOption>();
  for (const u of users) {
    if (!isUserWithSponsor(u)) continue;
    const s = u.sponsor;
    if (s == null) continue;
    if (!bySponsorId.has(s.id)) {
      bySponsorId.set(s.id, {
        id: s.id,
        publicName: s.publicName,
        tier: s.tier,
        isActive: s.isActive,
      });
    }
  }
  return Array.from(bySponsorId.values());
}

export function useActiveSponsorOptionsPaginatedQuery(page: number) {
  return useQuery({
    queryKey: [
      "sponsor-options",
      "paginated",
      page,
      ACTIVE_SPONSOR_OPTIONS_PAGE_SIZE,
    ],
    staleTime: 60_000,
    queryFn: async () => {
      try {
        const response = await userApi.getUsers({
          type: "SPONSOR",
          page,
          size: ACTIVE_SPONSOR_OPTIONS_PAGE_SIZE,
        });
        const envelope = response.data;
        const sponsors = mapPageToSponsorOptions(envelope.data ?? []);
        return {
          sponsors,
          totalPages: envelope.totalPages ?? 0,
          totalElements: envelope.totalElements ?? 0,
        };
      } catch (error) {
        throw new Error(getApiErrorMessage(error));
      }
    },
  });
}
