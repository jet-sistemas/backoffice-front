/** Alinhado à mensagem backend SUBSCRIBER_PAYMENT_ALREADY_REGISTERED. */
export function isPaidCycleAlreadyRegisteredReason(
  reason: string | null | undefined,
): boolean {
  return Boolean(reason?.includes('já registrado'))
}
