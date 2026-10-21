"use client";
import { t as translateCopy } from "@/lib/i18n";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { z } from "zod";

import { TradeProvider, useTrade } from "./TradeContext";
import Step1Details from "./steps/Step1Details";
import Step2Negotiation from "./steps/Step2Negotiation";
import Step3Review from "./steps/Step3Review";
import Link from "next/link";

const STELLAR_PUBLIC_KEY_REGEX = /^G[A-Z2-7]{55}$/;

const sharedTradeLinkSchema = z.object({
  seller: z
    .string()
    .trim()
    .regex(STELLAR_PUBLIC_KEY_REGEX, "Invalid Stellar public key")
    .optional(),
  commodity: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[\p{L}\p{N}\s\-_.,'()&/]+$/u, "Invalid commodity")
    .optional(),
  amount: z
    .string()
    .trim()
    .regex(/^\d+(\.\d+)?$/, "Invalid amount")
    .refine((value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0;
    }, "Amount must be positive")
    .optional(),
});

export type SharedTradeLinkData = {
  seller?: string;
  commodity?: string;
  amount?: string;
};

export function parseSharedTradeLink(
  params: Pick<URLSearchParams, "get">
): SharedTradeLinkData {
  const raw = {
    seller: params.get("seller") ?? undefined,
    commodity: params.get("commodity") ?? undefined,
    amount: params.get("amount") ?? undefined,
  };

  const result = sharedTradeLinkSchema.safeParse(raw);
  if (!result.success) {
    return {};
  }

  const data: SharedTradeLinkData = {};
  if (result.data.seller) data.seller = result.data.seller;
  if (result.data.commodity) data.commodity = result.data.commodity;
  if (result.data.amount) data.amount = result.data.amount;
  return data;
}

const STEPS = [
  { index: 1, label: "Details" },
  { index: 2, label: "Negotiation" },
  { index: 3, label: "Review" },
];

function StepIndicator() {
  const { step } = useTrade();
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map(({ index, label }, i) => (
        <div key={index} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step === index
                  ? "bg-gold text-text-inverse"
                  : step > index
                  ? "bg-emerald text-text-inverse"
                  : "bg-bg-elevated text-text-muted border border-border-default"
              }`}
            >
              {step > index ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                index
              )}
            </div>
            <span className={`text-xs ${step >= index ? "text-text-secondary" : "text-text-muted"}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mx-2 mb-4 transition-colors ${step > index ? "bg-emerald" : "bg-border-default"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function CreateTradeInner({ preFilled }: { preFilled: boolean }) {
  const { step } = useTrade();
  return (
    <div className="min-h-screen bg-bg-primary flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-6">
          <Link href="/" className="text-text-muted text-sm hover:text-text-secondary transition-colors">
            {translateCopy("ui.back_c32ae9f")}
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">{translateCopy("ui.create_trade_2747e94")}</h1>
          <p className="text-text-secondary text-sm mt-1">
            {translateCopy("ui.lock_agricultural_commodity_valu_6207352")}
          </p>
        </div>

        {preFilled && (
          <div
            role="status"
            className="mb-4 rounded-lg border border-emerald/40 bg-emerald/10 px-4 py-3 text-sm text-text-primary"
          >
            Pre-filled from shared trade link
          </div>
        )}

        <div className="bg-bg-card rounded-xl border border-border-default p-6 shadow-card">
          <StepIndicator />
          {step === 1 && <Step1Details />}
          {step === 2 && <Step2Negotiation />}
          {step === 3 && <Step3Review />}
        </div>
      </div>
    </div>
  );
}

export default function CreateTradePage() {
  const searchParams = useSearchParams();

  const initialData = useMemo(
    () => parseSharedTradeLink(searchParams),
    [searchParams]
  );

  const preFilled =
    Boolean(initialData.seller) ||
    Boolean(initialData.commodity) ||
    Boolean(initialData.amount);

  return (
    <TradeProvider initialData={initialData}>
      <CreateTradeInner preFilled={preFilled} />
    </TradeProvider>
  );
}
