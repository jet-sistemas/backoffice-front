import {
  IMAGE_UPLOAD_ERROR_EXPIRED,
  IMAGE_UPLOAD_ERROR_NETWORK,
} from '@/lib/image-upload-constants'

function isLikelyExpiredPresignedUrl(status: number): boolean {
  return status === 403 || status === 401
}

export async function putPresignedUpload(
  uploadUrl: string,
  body: Blob,
  contentType: string,
): Promise<void> {
  let res: Response
  try {
    res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body,
    })
  } catch {
    throw new Error(IMAGE_UPLOAD_ERROR_NETWORK)
  }

  if (!res.ok) {
    if (isLikelyExpiredPresignedUrl(res.status)) {
      throw new Error(IMAGE_UPLOAD_ERROR_EXPIRED)
    }
    throw new Error(IMAGE_UPLOAD_ERROR_NETWORK)
  }
}
