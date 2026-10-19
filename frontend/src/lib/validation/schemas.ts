import { z } from "zod";
import { t } from "@/lib/i18n";

export const TradeSchema = z.object({
  tradeId: z.string().min(1, t("validation.tradeIdRequired")),
  buyerAddress: z.string().min(1, t("validation.buyerAddressRequired")),
  sellerAddress: z.string().min(1, t("validation.sellerAddressRequired")),
  amountCngn: z
    .string()
    .regex(/^\d+(\.\d+)?$/, t("validation.amountPositiveNumber")),
  buyerLossBps: z
    .number()
    .int(t("validation.wholeNumber"))
    .min(0, t("validation.nonNegative"))
    .max(10000, t("validation.maxBps")),
  sellerLossBps: z
    .number()
    .int(t("validation.wholeNumber"))
    .min(0, t("validation.nonNegative"))
    .max(10000, t("validation.maxBps")),
  status: z.string().min(1, t("validation.statusRequired")),
  createdAt: z.string().min(1, t("validation.createdAtRequired")),
  updatedAt: z.string().min(1, t("validation.updatedAtRequired")),
});

export type Trade = z.infer<typeof TradeSchema>;

export const WalletSchema = z.object({
  balance: z
    .string()
    .regex(/^\d+(\.\d+)?$/, t("validation.balanceNonNegative")),
  asset: z.string().min(1, t("validation.assetRequired")),
});

export type Wallet = z.infer<typeof WalletSchema>;

export const DisputeSchema = z.object({
  tradeId: z.string().min(1, t("validation.tradeIdRequired")),
  reason: z
    .string()
    .min(10, t("validation.reasonMinLength"))
    .max(500, t("validation.reasonMaxLength")),
  category: z.enum(["quality", "delivery", "payment", "fraud", "other"], {
    message: t("validation.invalidDisputeCategory"),
  }),
  evidenceCids: z.array(z.string().min(1)).optional(),
});

export type Dispute = z.infer<typeof DisputeSchema>;

export const ManifestSchema = z.object({
  driverName: z
    .string()
    .min(2, t("validation.driverNameMinLength"))
    .max(100, t("validation.driverNameMaxLength")),
  driverPhone: z
    .string()
    .regex(/^\+?[0-9\s\-().]{7,20}$/, t("validation.invalidPhoneFormat")),
  licensePlate: z
    .string()
    .min(2, t("validation.licensePlateMinLength"))
    .max(20, t("validation.licensePlateMaxLength")),
  vehicleType: z.string().max(50, t("validation.vehicleTypeMaxLength")).optional(),
  notes: z.string().max(500, t("validation.notesMaxLength")).optional(),
});

export type Manifest = z.infer<typeof ManifestSchema>;

export const NotificationPreferencesSchema = z.object({
  email: z.boolean(),
  sms: z.boolean(),
  push: z.boolean(),
  tradeUpdates: z.boolean(),
  disputeAlerts: z.boolean(),
  settlementAlerts: z.boolean(),
  marketingEmails: z.boolean().default(false),
});

export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;

/**
 * Per-endpoint response schemas used to validate live API responses.
 * Attach these to `request()`/`requestWithResult()` so backend schema drift
 * is caught at the boundary instead of silently breaking the UI.
 */
export const TradeListSchema = z.array(TradeSchema);
export type TradeList = z.infer<typeof TradeListSchema>;

export const TradeResponseSchema = TradeSchema;
export type TradeResponse = z.infer<typeof TradeResponseSchema>;

export const WalletResponseSchema = WalletSchema;
export type WalletResponse = z.infer<typeof WalletResponseSchema>;

export const DisputeResponseSchema = DisputeSchema;
export type DisputeResponse = z.infer<typeof DisputeResponseSchema>;

export const ManifestResponseSchema = ManifestSchema;
export type ManifestResponse = z.infer<typeof ManifestResponseSchema>;

export const NotificationPreferencesResponseSchema = NotificationPreferencesSchema;
export type NotificationPreferencesResponse = z.infer<
  typeof NotificationPreferencesResponseSchema
>;

export const ApiErrorSchema = z.object({
  message: z.string().min(1, t("validation.errorMessageRequired")),
  code: z.string().optional(),
  details: z.unknown().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

export const EmptyResponseSchema = z.union([z.null(), z.undefined(), z.object({}).passthrough()]);
export type EmptyResponse = z.infer<typeof EmptyResponseSchema>;
