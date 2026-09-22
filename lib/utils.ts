import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const REFERRAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Generates an unambiguous 6-character referral code (no 0/O/1/I). */
export function generateReferralCode(length = 6): string {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  let code = "";
  for (let i = 0; i < length; i++) {
    code += REFERRAL_ALPHABET[bytes[i] % REFERRAL_ALPHABET.length];
  }
  return code;
}

const eurCompact = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const eurFull = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const integer = new Intl.NumberFormat("en-IE", { maximumFractionDigits: 0 });

export function formatEurCompact(value: number): string {
  return Math.abs(value) < 1000 ? eurFull.format(value) : eurCompact.format(value);
}

export function formatEur(value: number): string {
  return eurFull.format(value);
}

export function formatInteger(value: number): string {
  return integer.format(value);
}

/** Coerces PostgREST NUMERIC values (string | number | null) into a finite number. */
export function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}
