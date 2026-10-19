"use client";
import { t as translateCopy } from "@/lib/i18n";

import { TradeProvider, useTrade } from "./TradeContext";
import Step1Details from "./steps/Step1Details";
import Step2Negotiation from "./steps/Step2Negotiation";
import Step3Review from "./steps/Step3Review";
import StepIndicator from "@/components/ui/StepIndicator";
import Link from "next/link";

const STEPS = [
  { index: 1, label: "Details" },
  { index: 2, label: "Negotiation" },
  { index: 3, label: "Review" },
];

function CreateTradeInner() {
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

        <div className="bg-bg-card rounded-xl border border-border-default p-6 shadow-card">
          <StepIndicator steps={STEPS} currentStep={step} />
          {step === 1 && <Step1Details />}
          {step === 2 && <Step2Negotiation />}
          {step === 3 && <Step3Review />}
        </div>
      </div>
    </div>
  );
}

export default function CreateTradePage() {
  return (
    <TradeProvider>
      <CreateTradeInner />
    </TradeProvider>
  );
}
