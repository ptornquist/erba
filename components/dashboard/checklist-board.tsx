"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  ListChecks,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { humaniseSupabaseError } from "@/lib/errors";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
  complianceTaskSchema,
  type ComplianceTaskFormValues,
} from "@/lib/validations/dashboard";
import type { ComplianceTask } from "@/types/database";

interface ChecklistBoardProps {
  companyId: string;
  industry: string;
  initialTasks: ComplianceTask[];
}

type View = "all" | "open" | "done";

export function ChecklistBoard({
  companyId,
  industry,
  initialTasks,
}: ChecklistBoardProps) {
  const [tasks, setTasks] = useState<ComplianceTask[]>(initialTasks);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [view, setView] = useState<View>("all");
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ComplianceTaskFormValues>({
    resolver: zodResolver(complianceTaskSchema),
    defaultValues: { task_description: "" },
  });

  const completed = tasks.filter((t) => t.is_completed).length;
  const percent = tasks.length > 0 ? (completed / tasks.length) * 100 : 0;

  const visible = useMemo(() => {
    if (view === "open") return tasks.filter((t) => !t.is_completed);
    if (view === "done") return tasks.filter((t) => t.is_completed);
    return tasks;
  }, [tasks, view]);

  function markPending(id: string, pending: boolean) {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function toggleTask(task: ComplianceTask) {
    setError(null);
    const next = !task.is_completed;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, is_completed: next } : t)),
    );
    markPending(task.id, true);

    try {
      const { error: updateError } = await createClient()
        .from("compliance_tasks")
        .update({ is_completed: next })
        .eq("id", task.id)
        .eq("company_id", companyId);
      if (updateError) throw updateError;
    } catch (err) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, is_completed: task.is_completed } : t,
        ),
      );
      setError(
        humaniseSupabaseError(err, "Could not update the task. Please try again."),
      );
    } finally {
      markPending(task.id, false);
    }
  }

  async function deleteTask(task: ComplianceTask) {
    setError(null);
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    try {
      const { error: deleteError } = await createClient()
        .from("compliance_tasks")
        .delete()
        .eq("id", task.id)
        .eq("company_id", companyId);
      if (deleteError) throw deleteError;
    } catch (err) {
      setTasks((prev) => [...prev, task]);
      setError(
        humaniseSupabaseError(err, "Could not remove the task. Please try again."),
      );
    }
  }

  async function addTask(values: ComplianceTaskFormValues) {
    setError(null);
    try {
      const { data, error: insertError } = await createClient()
        .from("compliance_tasks")
        .insert({
          company_id: companyId,
          industry,
          task_description: values.task_description,
          is_completed: false,
        })
        .select("*")
        .single();
      if (insertError) throw insertError;
      setTasks((prev) => [...prev, data]);
      reset();
    } catch (err) {
      setError(
        humaniseSupabaseError(err, "Could not add the task. Please try again."),
      );
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Compliance readiness · {industry}
              </p>
              <p className="mt-1 font-mono text-4xl font-black tabular-nums">
                {Math.round(percent)}%
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
              {completed} of {tasks.length} obligations complete
            </div>
          </div>
          <Progress
            value={percent}
            aria-label="Checklist completion"
            indicatorClassName={cn(percent === 100 && "bg-primary")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ListChecks className="size-5 text-primary" aria-hidden="true" />
            Obligations
          </CardTitle>
          <div
            role="tablist"
            aria-label="Filter tasks"
            className="inline-flex rounded-lg border border-border bg-background p-1 text-sm"
          >
            {(
              [
                ["all", "All", tasks.length],
                ["open", "Open", tasks.length - completed],
                ["done", "Done", completed],
              ] as const
            ).map(([key, label, count]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={view === key}
                onClick={() => setView(key)}
                className={cn(
                  "rounded-md px-3 py-1.5 font-medium transition-colors",
                  view === key
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
                <span className="ml-1.5 font-mono text-xs text-muted-foreground">
                  {count}
                </span>
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {visible.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
              title={
                view === "done"
                  ? "Nothing completed yet"
                  : view === "open"
                    ? "All obligations complete"
                    : "No tasks yet"
              }
              description={
                view === "open"
                  ? "Your checklist is fully up to date. Add new obligations as regulation changes."
                  : "Add your first obligation below."
              }
              className="py-10"
            />
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {visible.map((task) => {
                const pending = pendingIds.has(task.id);
                return (
                  <li
                    key={task.id}
                    className="group flex items-start gap-3 px-4 py-3.5"
                  >
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.is_completed}
                      loading={pending}
                      onCheckedChange={() => toggleTask(task)}
                      aria-labelledby={`task-label-${task.id}`}
                      className="mt-0.5"
                    />
                    <label
                      id={`task-label-${task.id}`}
                      htmlFor={`task-${task.id}`}
                      className={cn(
                        "flex-1 cursor-pointer text-sm leading-relaxed transition-colors",
                        task.is_completed && "text-muted-foreground line-through",
                      )}
                    >
                      {task.task_description}
                    </label>
                    <div className="flex shrink-0 items-center gap-2">
                      {task.is_completed ? (
                        <Badge variant="success">Done</Badge>
                      ) : (
                        <Badge variant="outline">Open</Badge>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteTask(task)}
                        aria-label={`Remove task: ${task.task_description}`}
                        className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <form
            onSubmit={handleSubmit(addTask)}
            noValidate
            className="space-y-2 border-t border-border pt-4"
          >
            <label htmlFor="new-task" className="text-sm font-medium">
              Add an obligation
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="new-task"
                placeholder="e.g. Renew ISO 14001 certificate before Q2 audit"
                aria-invalid={Boolean(errors.task_description)}
                {...register("task_description")}
              />
              <Button type="submit" disabled={isSubmitting} className="h-11 sm:w-auto">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Plus />}
                Add task
              </Button>
            </div>
            {errors.task_description && (
              <p role="alert" className="text-sm text-destructive">
                {errors.task_description.message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
