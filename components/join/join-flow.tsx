"use client";

import { useState } from "react";
import { JoinWizard } from "@/components/join/join-wizard";
import { SignInForm } from "@/components/join/sign-in-form";

type Mode = "join" | "signin";

export function JoinFlow({ initialMode = "join" }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);

  return mode === "join" ? (
    <JoinWizard onSwitchToSignIn={() => setMode("signin")} />
  ) : (
    <SignInForm onSwitchToJoin={() => setMode("join")} />
  );
}
