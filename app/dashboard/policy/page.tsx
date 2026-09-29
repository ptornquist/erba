import type { Metadata } from "next";
import { PolicyDashboard } from "@/components/PolicyDashboard";

export const metadata: Metadata = {
  title: "Policy Dashboard",
};

export default function PolicyDashboardPage() {
  return <PolicyDashboard />;
}
