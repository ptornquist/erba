import { FileQuestion } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <span className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-secondary text-primary">
        <FileQuestion className="size-8" aria-hidden="true" />
      </span>
      <h1 className="text-4xl font-black tracking-tight">{t("title")}</h1>
      <p className="mt-3 max-w-md text-muted-foreground">{t("body")}</p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/">{t("home")}</ButtonLink>
        <ButtonLink href="/join" variant="outline">
          {t("join")}
        </ButtonLink>
      </div>
    </div>
  );
}
