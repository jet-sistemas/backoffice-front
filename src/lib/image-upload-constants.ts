export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number]

export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024

export const IMAGE_UPLOAD_ERROR_INVALID_TYPE =
  'Formato nao suportado. Use PNG, JPG ou WEBP.'

export const IMAGE_UPLOAD_ERROR_TOO_LARGE =
  'A imagem excede o tamanho maximo permitido.'

export const IMAGE_UPLOAD_ERROR_EXPIRED = 'O upload expirou. Tente novamente.'

export const IMAGE_UPLOAD_ERROR_NETWORK =
  'Nao foi possivel enviar a imagem. Verifique sua conexao.'

export const IMAGE_UPLOAD_ERROR_CONFIRM =
  'Imagem enviada, mas nao confirmada. Tente finalizar novamente.'

export function validateImageFileForUpload(file: File): void {
  if (
    !ALLOWED_IMAGE_MIME_TYPES.includes(file.type as AllowedImageMimeType)
  ) {
    throw new Error(IMAGE_UPLOAD_ERROR_INVALID_TYPE)
  }
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error(IMAGE_UPLOAD_ERROR_TOO_LARGE)
  }
  if (file.size < 1) {
    throw new Error(IMAGE_UPLOAD_ERROR_INVALID_TYPE)
  }
}
