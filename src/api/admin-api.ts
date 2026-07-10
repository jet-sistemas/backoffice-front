import { api } from '@/lib/axios'
import type {
  AdminCheckinListParams,
  PaginatedAdminCheckinsResponse,
} from '@/types/admin-checkin'

export const adminApi = {
  getAdminCheckins(params: AdminCheckinListParams) {
    return api.get<PaginatedAdminCheckinsResponse>('/v1/admin/check-ins', {
      params: {
        page: params.page,
        size: params.size,
        ...(params.sponsorId != null ? { sponsorId: params.sponsorId } : {}),
        ...(params.memberUserId != null ? { memberUserId: params.memberUserId } : {}),
        ...(params.startDate ? { startDate: params.startDate } : {}),
        ...(params.endDate ? { endDate: params.endDate } : {}),
        ...(params.validated != null ? { validated: params.validated } : {}),
      },
    })
  },
}
