import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#ffffff",
          color: "#0a1628",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <span
          style={{
            display: "flex",
            width: "4rem",
            height: "4rem",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "1rem",
            background: "#e8eef8",
            color: "#003399",
            marginBottom: "1.5rem",
          }}
        >
          <FileQuestion size={32} aria-hidden="true" />
        </span>
        <h1 style={{ fontSize: "2rem", margin: 0 }}>{SITE_NAME}</h1>
        <p style={{ marginTop: "0.75rem", color: "#4a5d7a", maxWidth: "28rem" }}>
          Page not found. The regulation may be endless, but this URL is not.
        </p>
        <p style={{ marginTop: "1.5rem" }}>
          <Link href="/" style={{ color: "#003399", fontWeight: 600 }}>
            Back home
          </Link>
        </p>
      </body>
    </html>
  );
}
