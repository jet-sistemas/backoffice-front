import { api } from '@/lib/axios'
import type {
  AccountValidationRequestDTO,
  EnvelopeAccountValidationResultDTO,
} from '@/types/account-validation'

export const accountValidationApi = {
  confirm(data: AccountValidationRequestDTO) {
    return api.post<EnvelopeAccountValidationResultDTO>(
      '/v1/account-validation/confirm',
      data,
    )
  },
}
