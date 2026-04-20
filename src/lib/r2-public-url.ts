export function resolveR2PublicUrl(
  ref: string | null | undefined,
): string | undefined {
  if (ref == null || ref.trim() === '') return undefined
  const t = ref.trim()
  if (/^https?:\/\//i.test(t)) return t
  const base = (import.meta.env.VITE_R2_PUBLIC_BASE_URL ?? '').replace(/\/+$/, '')
  if (!base) return t
  const key = t.replace(/^\/+/, '')
  return `${base}/${key}`
}
