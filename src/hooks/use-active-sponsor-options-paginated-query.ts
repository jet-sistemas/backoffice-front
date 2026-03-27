import { useQuery } from "@tanstack/react-query";

import { userApi } from "@/api/user-api";
import { getApiErrorMessage } from "@/lib/api-error";
import type { UserWithSponsorDTO } from "@/types/user";

export const ACTIVE_SPONSOR_OPTIONS_PAGE_SIZE = 30;

export interface ActiveSponsorOption {
  id: number;
  publicName: string;
}

function mapPageToActiveSponsors(
  users: UserWithSponsorDTO[],
): ActiveSponsorOption[] {
  const bySponsorId = new Map<number, ActiveSponsorOption>();
  for (const u of users) {
    const s = u.sponsor;
    if (s == null || !s.isActive) continue;
    if (!bySponsorId.has(s.id)) {
      bySponsorId.set(s.id, { id: s.id, publicName: s.publicName });
    }
  }
  return Array.from(bySponsorId.values());
}

export function useActiveSponsorOptionsPaginatedQuery(page: number) {
  return useQuery({
    queryKey: [
      "sponsor-options",
      "active-paginated",
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
        const sponsors = mapPageToActiveSponsors(envelope.data ?? []);
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
