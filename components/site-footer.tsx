import { getTranslations } from "next-intl/server";
import { ShieldAlert } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CONTACT_EMAIL, SITE_FULL_NAME, SITE_NAME } from "@/lib/constants";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between lg:px-8">
        <div className="max-w-sm space-y-3">
          <div className="flex items-center gap-2.5 font-bold">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldAlert className="size-4" aria-hidden="true" />
            </span>
            <span>{SITE_NAME}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {SITE_FULL_NAME}. {t("blurb")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div className="space-y-3">
            <p className="font-semibold">{t("platform")}</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/join" className="hover:text-foreground">
                  {tn("join")}
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground">
                  {tn("login")}
                </Link>
              </li>
              <li>
                <Link href="/pain-index" className="hover:text-foreground">
                  {tn("painIndex")}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" prefetch={false} className="hover:text-foreground">
                  {t("memberDashboard")}
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="font-semibold">{t("campaigns")}</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/#why-now" className="hover:text-foreground">
                  {t("farmerProtests")}
                </Link>
              </li>
              <li>
                <Link href="/#why-now" className="hover:text-foreground">
                  {t("greenDeal")}
                </Link>
              </li>
              <li>
                <Link href="/#why-now" className="hover:text-foreground">
                  {t("mercosur")}
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="font-semibold">{t("contact")}</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-foreground">
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>{t("cities")}</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {SITE_FULL_NAME}. {t("rights")}
          </p>
          <p>{t("anonymousNote")}</p>
        </div>
      </div>
    </footer>
  );
}
