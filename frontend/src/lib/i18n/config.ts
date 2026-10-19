/**
 * i18n configuration. Core market is Nigeria, so `en-NG` / NGN are the defaults
 * for every locale-aware formatter and the base message catalog.
 */
export const DEFAULT_LOCALE = "en-NG";
export const DEFAULT_CURRENCY = "NGN";

export const SUPPORTED_LOCALES = [
  "en-NG",
  "en-US",
  "ha-NG",
  "yo-NG",
  "ig-NG",
  "pseudo",
] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

let activeLocale: Locale | undefined;

/** Set by LocaleProvider when a user selects a language. */
export function setActiveLocale(locale: Locale | undefined): void {
  activeLocale = locale;
}

/**
 * Pseudo-localization surfaces hardcoded strings (they stay ASCII while
 * catalog strings become accented + padded). Enabled at build/run time with
 * `NEXT_PUBLIC_PSEUDO_LOCALE=1` or by passing `locale: "pseudo"` explicitly.
 */
export function isPseudoLocaleEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_PSEUDO_LOCALE === "1" ||
    process.env.NEXT_PUBLIC_PSEUDO_LOCALE === "true"
  );
}

export function resolveLocale(explicit?: Locale): Locale {
  if (explicit) return explicit;
  if (isPseudoLocaleEnabled()) return "pseudo";
  if (activeLocale) return activeLocale;
  const env = process.env.NEXT_PUBLIC_LOCALE as Locale | undefined;
  if (env && SUPPORTED_LOCALES.includes(env)) return env;
  return DEFAULT_LOCALE;
}

/** Locale actually handed to `Intl` — "pseudo" has no CLDR data, fall back to en-NG. */
export function intlLocale(locale: Locale): string {
  return locale === "pseudo" ? DEFAULT_LOCALE : locale;
}

export interface LocaleFormattingExample {
  locale: Locale;
  label: string;
  groupSeparator: string;
  decimalSeparator: string;
  defaultCurrency: string;
  representativeAmount: string;
  currencyExample: string;
  ambiguityExamples: readonly string[];
}

/**
 * Supported locale specifications and representative amount, separator,
 * currency, and ambiguity examples for canonical money parsing and display.
 */
export const SUPPORTED_LOCALE_SPECS: Record<Locale, LocaleFormattingExample> = {
  "en-NG": {
    locale: "en-NG",
    label: "English (Nigeria)",
    groupSeparator: ",",
    decimalSeparator: ".",
    defaultCurrency: "NGN",
    representativeAmount: "1,250,000.50",
    currencyExample: "₦1,250,000.50",
    ambiguityExamples: [
      "1,250 (three digits after comma: group separator vs decimal)",
      "N1,250 (ambiguous 'N' prefix vs ₦ / NGN / cNGN)",
    ],
  },
  "en-US": {
    locale: "en-US",
    label: "English (United States)",
    groupSeparator: ",",
    decimalSeparator: ".",
    defaultCurrency: "USD",
    representativeAmount: "1,250,000.50",
    currencyExample: "$1,250,000.50",
    ambiguityExamples: [
      "$1,250 (ambiguous '$' symbol across USD, CAD, AUD)",
      "1,250.00 vs 1.250,00 mixed-locale input",
    ],
  },
  "ha-NG": {
    locale: "ha-NG",
    label: "Hausa (Nigeria)",
    groupSeparator: ",",
    decimalSeparator: ".",
    defaultCurrency: "NGN",
    representativeAmount: "1,250,000.50",
    currencyExample: "₦1,250,000.50",
    ambiguityExamples: [
      "Naira 1,250 vs cNGN 1,250 (fiat NGN vs on-chain cNGN)",
    ],
  },
  "yo-NG": {
    locale: "yo-NG",
    label: "Yoruba (Nigeria)",
    groupSeparator: ",",
    decimalSeparator: ".",
    defaultCurrency: "NGN",
    representativeAmount: "1,250,000.50",
    currencyExample: "₦1,250,000.50",
    ambiguityExamples: [
      "₦1,250 vs 1,250 cNGN (symbol-prefixed fiat vs token code)",
    ],
  },
  "ig-NG": {
    locale: "ig-NG",
    label: "Igbo (Nigeria)",
    groupSeparator: ",",
    decimalSeparator: ".",
    defaultCurrency: "NGN",
    representativeAmount: "1,250,000.50",
    currencyExample: "₦1,250,000.50",
    ambiguityExamples: [
      "1,250,000 vs 1.250.000 (period vs comma thousands grouping)",
    ],
  },
  pseudo: {
    locale: "pseudo",
    label: "Pseudo-Locale (QA)",
    groupSeparator: ",",
    decimalSeparator: ".",
    defaultCurrency: "NGN",
    representativeAmount: "1,250,000.50",
    currencyExample: "₦1,250,000.50",
    ambiguityExamples: ["[⟦₦1,250.00⟧] pseudo-wrapped test string"],
  },
};
