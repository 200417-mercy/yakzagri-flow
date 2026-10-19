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

/**
 * Ambiguous currency symbols that require explicit ISO 4217 currency code
 * disambiguation (e.g., "$" can mean USD, CAD, AUD; "₦" vs NGN in mixed-locale text).
 */
export const AMBIGUOUS_CURRENCY_SYMBOLS: Readonly<Record<string, readonly string[]>> = {
  $: ["USD", "CAD", "AUD", "NZD"],
  "£": ["GBP", "EGP"],
  "¥": ["JPY", "CNY"],
};

export interface LocaleInputDiagnostic {
  isSupportedLocale: boolean;
  resolvedLocale: Locale;
  hasAmbiguousSymbol: boolean;
  ambiguousSymbols: string[];
  hasMixedSeparators: boolean;
  clarificationMessage?: string;
}

/**
 * Clarifies mixed-locale number separators, ambiguous currency symbols, and
 * unsupported language tags before canonical parsing or contract unit conversion.
 */
export function clarifyLocaleAndCurrencyInput(
  rawInput: string,
  requestedLocale?: string,
): LocaleInputDiagnostic {
  const isSupportedLocale =
    !requestedLocale || (SUPPORTED_LOCALES as readonly string[]).includes(requestedLocale);
  const resolved = isSupportedLocale && requestedLocale
    ? (requestedLocale as Locale)
    : DEFAULT_LOCALE;

  const ambiguousSymbols = Object.keys(AMBIGUOUS_CURRENCY_SYMBOLS).filter((sym) =>
    rawInput.includes(sym),
  );
  const hasAmbiguousSymbol = ambiguousSymbols.length > 0;

  // Detect mixed grouping/decimal conventions such as multiple decimal points or interleaved separators
  const dotCount = (rawInput.match(/\./g) ?? []).length;
  const commaCount = (rawInput.match(/,/g) ?? []).length;
  const hasMixedSeparators = (dotCount > 1 && commaCount >= 1) || (dotCount > 0 && commaCount > 0 && rawInput.indexOf(".") < rawInput.indexOf(","));

  const reasons: string[] = [];
  if (!isSupportedLocale && requestedLocale) {
    reasons.push(
      `Unsupported locale "${requestedLocale}"; falling back to ${DEFAULT_LOCALE}.`,
    );
  }
  if (hasAmbiguousSymbol) {
    reasons.push(
      `Ambiguous currency symbol (${ambiguousSymbols.join(", ")}); specify an explicit ISO code such as USDC or NGN.`,
    );
  }
  if (hasMixedSeparators) {
    reasons.push(
      "Mixed locale separators detected; use period (.) as the decimal separator and comma (,) for thousands.",
    );
  }

  return {
    isSupportedLocale,
    resolvedLocale: resolved,
    hasAmbiguousSymbol,
    ambiguousSymbols,
    hasMixedSeparators,
    clarificationMessage: reasons.length > 0 ? reasons.join(" ") : undefined,
  };
}

