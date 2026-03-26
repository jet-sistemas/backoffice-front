import { z } from "zod";

export const BENEFIT_DESCRIPTION_MAX_LENGTH = 255;

const optionalTrimmed = z
  .string()
  .max(
    BENEFIT_DESCRIPTION_MAX_LENGTH,
    `O campo deve ter no máximo ${BENEFIT_DESCRIPTION_MAX_LENGTH} caracteres`,
  )
  .optional()
  .transform((v) => {
    const t = v?.trim();
    return t === "" || t == null ? undefined : t;
  });

export const benefitFormSchema = z.object({
  name: z.string().min(1, "Informe o nome do benefício").trim(),
  description: optionalTrimmed,
  address: optionalTrimmed,
  sponsorId: z.union([z.number().int().positive(), z.null()]).default(null),
});

export type BenefitFormData = z.infer<typeof benefitFormSchema>;
