import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const retiredLocalePrefixes = [
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

const nextConfig: NextConfig = {
  async redirects() {
    return retiredLocalePrefixes.flatMap((code) => [
      { source: `/${code}`, destination: "/", permanent: true },
      { source: `/${code}/:path*`, destination: "/:path*", permanent: true },
    ]);
  },
};

export default withNextIntl(nextConfig);
