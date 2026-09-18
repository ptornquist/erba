"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Building2,
  EyeOff,
  Loader2,
  MessagesSquare,
  Send,
  Trash2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
  forumPostSchema,
  type ForumPostFormValues,
} from "@/lib/validations/dashboard";
import type { Company, ForumPost } from "@/types/database";

export type ForumPostWithAuthor = ForumPost & {
  author: Pick<Company, "name" | "industry" | "is_anonymous"> | null;
};

interface ForumFeedProps {
  company: Company;
  initialPosts: ForumPostWithAuthor[];
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const absolute = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60_000);
  if (Math.abs(minutes) < 60) return relative.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relative.format(-hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return relative.format(-days, "day");
  return absolute.format(new Date(iso));
}

function displayName(author: ForumPostWithAuthor["author"]): string {
  if (!author) return "Alliance member";
  return author.is_anonymous ? "Anonymous member" : author.name;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function ForumFeed({ company, initialPosts }: ForumFeedProps) {
  const [posts, setPosts] = useState<ForumPostWithAuthor[]>(initialPosts);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ForumPostFormValues>({
    resolver: zodResolver(forumPostSchema),
    defaultValues: { content: "" },
  });

  const draft = useWatch({ control, name: "content" }) ?? "";

  async function publish(values: ForumPostFormValues) {
    setError(null);
    try {
      const { data, error: insertError } = await createClient()
        .from("forum_posts")
        .insert({ company_id: company.id, content: values.content })
        .select("*")
        .single();
      if (insertError) throw insertError;

      setPosts((prev) => [
        {
          ...data,
          author: {
            name: company.name,
            industry: company.industry,
            is_anonymous: company.is_anonymous,
          },
        },
        ...prev,
      ]);
      reset();
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Could not publish your post. Please try again.",
      );
    }
  }

  async function remove(post: ForumPostWithAuthor) {
    setError(null);
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    try {
      const { error: deleteError } = await createClient()
        .from("forum_posts")
        .delete()
        .eq("id", post.id)
        .eq("company_id", company.id);
      if (deleteError) throw deleteError;
    } catch (err) {
      setPosts((prev) =>
        [...prev, post].sort((a, b) => b.created_at.localeCompare(a.created_at)),
      );
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Could not delete the post. Please try again.",
      );
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Share a strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(publish)} noValidate className="space-y-3">
              <Textarea
                rows={4}
                placeholder="How is your team handling supplier questionnaires under CSDDD? What worked, what didn't?"
                aria-label="New post"
                aria-invalid={Boolean(errors.content)}
                {...register("content")}
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  {company.is_anonymous ? (
                    <>
                      <EyeOff className="size-3.5" aria-hidden="true" />
                      Posting as <span className="font-medium text-foreground">Anonymous member</span> · {company.industry}
                    </>
                  ) : (
                    <>
                      <Building2 className="size-3.5" aria-hidden="true" />
                      Posting as <span className="font-medium text-foreground">{company.name}</span>
                    </>
                  )}
                </p>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "font-mono text-xs tabular-nums",
                      draft.length > 2000 ? "text-destructive" : "text-muted-foreground",
                    )}
                  >
                    {draft.length}/2000
                  </span>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
                    Publish
                  </Button>
                </div>
              </div>
              {errors.content && (
                <p role="alert" className="text-sm text-destructive">
                  {errors.content.message}
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {posts.length === 0 ? (
          <EmptyState
            icon={MessagesSquare}
            title="No posts yet"
            description="Be the first to share how your organisation is tackling a regulatory hurdle."
          />
        ) : (
          <ol className="space-y-4">
            {posts.map((post) => {
              const name = displayName(post.author);
              const mine = post.company_id === company.id;
              const anonymous = post.author?.is_anonymous ?? false;
              return (
                <li key={post.id}>
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                            anonymous
                              ? "bg-secondary text-muted-foreground"
                              : "bg-primary/15 text-primary",
                          )}
                          aria-hidden="true"
                        >
                          {anonymous ? <EyeOff className="size-4" /> : initials(name)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <p className="font-semibold">{name}</p>
                            {post.author?.industry && (
                              <Badge variant="outline">{post.author.industry}</Badge>
                            )}
                            {mine && <Badge variant="secondary">You</Badge>}
                            <time
                              dateTime={post.created_at}
                              title={absolute.format(new Date(post.created_at))}
                              className="text-xs text-muted-foreground"
                            >
                              {timeAgo(post.created_at)}
                            </time>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap leading-relaxed">
                            {post.content}
                          </p>
                        </div>
                        {mine && (
                          <button
                            type="button"
                            onClick={() => remove(post)}
                            aria-label="Delete your post"
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <aside className="space-y-4">
        <Card className="bg-secondary/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Hub guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm text-muted-foreground">
            <p>▸ Share practical tactics: templates, vendors, timelines, costs.</p>
            <p>▸ Never post commercially sensitive pricing or customer data.</p>
            <p>▸ Anonymous companies appear as &ldquo;Anonymous member&rdquo; with industry only.</p>
            <p>▸ Posts are visible to verified ERBA members exclusively.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Active regulatory threads</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {["CSRD", "CSDDD", "EUDR", "CBAM", "AI Act", "PPWR", "NIS2"].map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
