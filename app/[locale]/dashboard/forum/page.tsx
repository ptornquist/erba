import type { Metadata } from "next";
import { AlertTriangle, Building2 } from "lucide-react";
import { ForumFeed, type ForumPostWithAuthor } from "@/components/dashboard/forum-feed";
import { PageHeader } from "@/components/dashboard/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getTranslations } from "next-intl/server";
import { getDashboardContext } from "@/lib/dashboard";

export const metadata: Metadata = {
  title: "Networking Hub",
};

const FEED_LIMIT = 100;

export default async function ForumPage() {
  const t = await getTranslations("dashboard");
  const { supabase, company } = await getDashboardContext();

  if (!company) {
    return (
      <>
        <PageHeader eyebrow="Alliance Networking Hub" title="Networking hub" />
        <EmptyState
          icon={Building2}
          title="Finish joining first"
          description="Posts are published on behalf of your membership profile. Complete onboarding to join the conversation."
          action={<ButtonLink href="/join">{t("completeOnboarding")}</ButtonLink>}
        />
      </>
    );
  }

  const { data, error } = await supabase
    .from("forum_posts")
    .select("*, companies(name, industry, is_anonymous)")
    .order("created_at", { ascending: false })
    .limit(FEED_LIMIT);

  const posts: ForumPostWithAuthor[] = (data ?? []).map((row) => {
    const { companies, ...post } = row;
    return { ...post, author: companies ?? null };
  });

  return (
    <>
      <PageHeader
        eyebrow="Alliance Networking Hub"
        title="Networking hub"
        description="A members-only forum where compliance leaders trade strategies for specific regulatory hurdles."
      />

      {error && (
        <Alert variant="warning">
          <AlertTriangle />
          <AlertTitle>Could not load the feed</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <ForumFeed company={company} initialPosts={posts} />
    </>
  );
}
