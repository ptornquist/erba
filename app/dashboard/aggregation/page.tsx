import type { Metadata } from "next";
import { AggregationDashboard } from "@/components/AggregationDashboard";

export const metadata: Metadata = {
  title: "Aggregation",
};

export default function AggregationPage() {
  return <AggregationDashboard />;
}
