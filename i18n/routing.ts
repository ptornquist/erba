import { defineRouting } from "next-intl/routing";

/** Official EU languages (24). */
export const locales = [
  "bg",
  "cs",
  "da",
  "de",
  "el",
  "en",
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

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  bg: "Български",
  cs: "Čeština",
  da: "Dansk",
  de: "Deutsch",
  el: "Ελληνικά",
  en: "English",
  es: "Español",
  et: "Eesti",
  fi: "Suomi",
  fr: "Français",
  ga: "Gaeilge",
  hr: "Hrvatski",
  hu: "Magyar",
  it: "Italiano",
  lt: "Lietuvių",
  lv: "Latviešu",
  mt: "Malti",
  nl: "Nederlands",
  pl: "Polski",
  pt: "Português",
  ro: "Română",
  sk: "Slovenčina",
  sl: "Slovenščina",
  sv: "Svenska",
};

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeDetection: true,
});

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Prefix a pathname for a given locale (`en` stays unprefixed). */
export function localizePath(locale: string, path: string): string {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  if (locale === routing.defaultLocale) return safePath;
  if (safePath === "/") return `/${locale}`;
  return `/${locale}${safePath}`;
}

/** Strip a leading `/{locale}` if present. */
export function stripLocalePrefix(pathname: string): {
  locale: Locale;
  pathname: string;
} {
  const parts = pathname.split("/");
  const maybe = parts[1];
  if (maybe && isLocale(maybe)) {
    const rest = `/${parts.slice(2).join("/")}`;
    return {
      locale: maybe,
      pathname: rest === "/" ? "/" : rest.replace(/\/$/, "") || "/",
    };
  }
  return { locale: routing.defaultLocale, pathname: pathname || "/" };
}
