import { FileQuestion } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <span className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-secondary text-primary">
        <FileQuestion className="size-8" aria-hidden="true" />
      </span>
      <h1 className="text-4xl font-black tracking-tight">Page not found</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The regulation may be endless, but this URL is not. Let&apos;s get you
        back to the movement.
      </p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/">Back home</ButtonLink>
        <ButtonLink href="/join" variant="outline">
          Join Free
        </ButtonLink>
      </div>
    </div>
  );
}
