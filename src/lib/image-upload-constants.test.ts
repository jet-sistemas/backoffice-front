import { describe, expect, it } from 'vitest'

import {
  IMAGE_UPLOAD_ERROR_INVALID_TYPE,
  IMAGE_UPLOAD_ERROR_TOO_LARGE,
  MAX_IMAGE_UPLOAD_BYTES,
  validateImageFileForUpload,
} from '@/lib/image-upload-constants'

function makeFile(name: string, type: string, size: number): File {
  return new File([new Uint8Array(size)], name, { type })
}

describe('validateImageFileForUpload', () => {
  it('accepts png under max size', () => {
    expect(() =>
      validateImageFileForUpload(makeFile('a.png', 'image/png', 1024)),
    ).not.toThrow()
  })

  it('rejects wrong mime type', () => {
    expect(() =>
      validateImageFileForUpload(makeFile('a.gif', 'image/gif', 100)),
    ).toThrow(IMAGE_UPLOAD_ERROR_INVALID_TYPE)
  })

  it('rejects oversize file', () => {
    expect(() =>
      validateImageFileForUpload(
        makeFile('a.png', 'image/png', MAX_IMAGE_UPLOAD_BYTES + 1),
      ),
    ).toThrow(IMAGE_UPLOAD_ERROR_TOO_LARGE)
  })

  it('rejects empty file', () => {
    expect(() =>
      validateImageFileForUpload(makeFile('a.png', 'image/png', 0)),
    ).toThrow(IMAGE_UPLOAD_ERROR_INVALID_TYPE)
  })
})
