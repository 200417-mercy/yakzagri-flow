import { z } from "zod";
import { StrKey } from "@stellar/stellar-sdk";
import { t } from "@/lib/i18n";

export function createStep1Schema() {
  return z.object({
    commodity: z.string().min(1, t("validation.selectCommodity")),
    quantity: z.string().refine(
      (val) => {
        const n = parseFloat(val);
        return !isNaN(n) && n > 0;
      },
      { message: t("validation.quantityPositive") }
    ),
    unit: z.string().min(1, t("validation.selectUnit")),
    pricePerUnit: z.string().refine(
      (val) => {
        const n = parseFloat(val);
        return !isNaN(n) && n > 0;
      },
      { message: t("validation.pricePositive") }
    ),
    currency: z.string().min(1),
    sellerAddress: z.string().refine(
      (val) => val !== "" && StrKey.isValidEd25519PublicKey(val.trim()),
      { message: t("validation.invalidStellarKey") }
    ),
  });
}

export const step1Schema = createStep1Schema();

export function createStep2Schema() {
  return z.object({
    buyerRatio: z.number().min(0).max(100),
    sellerRatio: z.number().min(0).max(100),
    deliveryDays: z.string().refine(
      (val) => {
        const n = parseInt(val);
        return !isNaN(n) && n >= 1 && n <= 90;
      },
      { message: t("validation.deliveryWindowRange") }
    ),
  });
}

export const step2Schema = createStep2Schema();

export const step3Schema = z.object({
  commodity: z.string().min(1),
  quantity: z.string().min(1),
  unit: z.string().min(1),
  pricePerUnit: z.string().min(1),
  currency: z.string().min(1),
  sellerAddress: z.string().min(1),
  buyerRatio: z.number(),
  sellerRatio: z.number(),
  deliveryDays: z.string().min(1),
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;

export function validateStep1(data: Record<string, unknown>): Record<string, string> {
  const result = createStep1Schema().safeParse(data);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    if (!errors[path]) errors[path] = issue.message;
  }
  return errors;
}

export function validateStep2(data: { buyerRatio: number; sellerRatio: number; deliveryDays: string }): Record<string, string> {
  const errors: Record<string, string> = {};
  if (data.buyerRatio + data.sellerRatio !== 100) {
    errors.sum = t("validation.lossRatiosSum");
  }
  const result = createStep2Schema().safeParse(data);
  if (!result.success) {
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      if (!errors[path]) errors[path] = issue.message;
    }
  }
  return errors;
}
