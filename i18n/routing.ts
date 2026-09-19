import { defineRouting } from "next-intl/routing";

export const locales = ["en"] as const;

export type Locale = (typeof locales)[number];

/** Former locale prefixes; keep redirecting them to unprefixed English URLs. */
export const RETIRED_LOCALE_PREFIXES = [
  "bg",
  "cs",
  "da",
  "de",
  "el",
  "es",
  "et",
  "fi",
  "fr",
  "ga",
  "hr",
  "hu",
  "it",
  "lt",
  "lv",
  "mt",
  "nl",
  "pl",
  "pt",
  "ro",
  "sk",
  "sl",
  "sv",
] as const;

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeDetection: false,
});

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function isRetiredLocalePrefix(value: string): boolean {
  return (RETIRED_LOCALE_PREFIXES as readonly string[]).includes(value);
}

export function hasRetiredLocalePrefix(pathname: string): boolean {
  const maybe = pathname.split("/")[1];
  return Boolean(maybe && isRetiredLocalePrefix(maybe));
}

/** English is unprefixed; other codes are no longer valid locales. */
export function localizePath(_locale: string, path: string): string {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return safePath;
}

/** Strip a leading `/{locale}` or a retired prefix such as `/de`. */
export function stripLocalePrefix(pathname: string): {
  locale: Locale;
  pathname: string;
} {
  const parts = pathname.split("/");
  const maybe = parts[1];
  if (maybe && (isLocale(maybe) || isRetiredLocalePrefix(maybe))) {
    const rest = `/${parts.slice(2).join("/")}`;
    return {
      locale: routing.defaultLocale,
      pathname: rest === "/" ? "/" : rest.replace(/\/$/, "") || "/",
    };
  }
  return { locale: routing.defaultLocale, pathname: pathname || "/" };
}
