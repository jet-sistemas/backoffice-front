import { api } from '@/lib/axios'
import type {
  EnvelopeUploadConfirmDTO,
  EnvelopeUploadDeleteDTO,
  EnvelopeUploadInitDTO,
  UploadConfirmDTO,
  UploadConfirmResponseDTO,
  UploadDeleteDTO,
  UploadDeleteResponseDTO,
  UploadInitDTO,
  UploadInitResponseDTO,
} from '@/types/upload'

function unwrapInit(envelope: EnvelopeUploadInitDTO): UploadInitResponseDTO {
  if (envelope.status !== 'OK' || envelope.data == null) {
    throw new Error(
      envelope.message?.trim() ||
        envelope.messages?.find((m) => m.trim()) ||
        'Não foi possível iniciar o envio da imagem.',
    )
  }
  return envelope.data
}

function unwrapConfirm(
  envelope: EnvelopeUploadConfirmDTO,
): UploadConfirmResponseDTO {
  if (envelope.status !== 'OK' || envelope.data == null) {
    throw new Error(
      envelope.message?.trim() ||
        envelope.messages?.find((m) => m.trim()) ||
        'Não foi possível confirmar o envio da imagem.',
    )
  }
  return envelope.data
}

function unwrapDelete(
  envelope: EnvelopeUploadDeleteDTO,
): UploadDeleteResponseDTO {
  if (envelope.status !== 'OK') {
    throw new Error(
      envelope.message?.trim() ||
        envelope.messages?.find((m) => m.trim()) ||
        'Não foi possível remover a imagem.',
    )
  }
  return envelope.data ?? { success: true }
}

export const uploadsApi = {
  initUpload(payload: UploadInitDTO) {
    return api
      .post<EnvelopeUploadInitDTO>('/v1/admin/uploads/init', payload)
      .then((res) => unwrapInit(res.data))
  },

  confirmUpload(payload: UploadConfirmDTO) {
    return api
      .post<EnvelopeUploadConfirmDTO>('/v1/admin/uploads/confirm', payload)
      .then((res) => unwrapConfirm(res.data))
  },

  deleteUpload(payload: UploadDeleteDTO) {
    return api
      .delete<EnvelopeUploadDeleteDTO>('/v1/admin/uploads', { data: payload })
      .then((res) => unwrapDelete(res.data))
  },
}
