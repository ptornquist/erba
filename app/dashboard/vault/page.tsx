import type { Metadata } from "next";
import { EvidenceVault } from "@/components/EvidenceVault";

export const metadata: Metadata = {
  title: "Evidence Vault",
};

export default function VaultPage() {
  return <EvidenceVault />;
}
