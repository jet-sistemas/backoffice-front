export interface PaymentMarkBlockFields {
  paymentMarkBlockedCode?: string | null
}

/** Alinhado ao código backend PaymentMarkBlockReasonEnum.ALREADY_REGISTERED. */
export function isPaidCycleAlreadyRegistered(
  fields: PaymentMarkBlockFields,
): boolean {
  return fields.paymentMarkBlockedCode === 'ALREADY_REGISTERED'
}
