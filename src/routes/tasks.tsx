import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Clock, Flag, ListTodo, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { planTasks } from "@/lib/ai.functions";
import { saveHistoryItem } from "@/lib/history";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Nova AI" },
      { name: "description", content: "Break down goals into a realistic schedule." },
    ],
  }),
  component: TasksPage,
});

interface Task {
  title: string;
  durationMinutes: number;
  priority: "high" | "medium" | "low";
}
interface Day {
  day: string;
  focus: string;
  tasks: Task[];
}
interface Plan {
  overview: string;
  days: Day[];
}

const priorityStyles: Record<Task["priority"], string> = {
  high: "bg-destructive/15 text-destructive border-destructive/30",
  medium: "bg-warning/15 text-warning-foreground border-warning/40",
  low: "bg-success/15 text-success-foreground border-success/40",
};

function TasksPage() {
  const fn = useServerFn(planTasks);
  const [goal, setGoal] = useState("");
  const [timeframe, setTimeframe] = useState("1 week");
  const [hours, setHours] = useState(3);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);

  const submit = async () => {
    if (!goal.trim()) return toast.error("Enter a goal.");
    setLoading(true);
    setPlan(null);
    try {
      const { plan } = await fn({ data: { goal, timeframe, hoursPerDay: hours } });
      setPlan(plan as Plan);
      saveHistoryItem({
        kind: "tasks",
        title: `Plan: ${goal.slice(0, 60)}`,
        content: JSON.stringify(plan, null, 2),
      });
      toast.success("Plan generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="AI Task Planner" description="Turn goals into a prioritized schedule">
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="shadow-card lg:col-span-2">
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg gradient-primary text-primary-foreground">
                <ListTodo className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold">Plan a goal</div>
                <div className="text-xs text-muted-foreground">Describe what you want to achieve</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Goal</Label>
              <Input
                id="goal"
                placeholder="e.g. Launch my portfolio site"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tf">Timeframe</Label>
              <Input
                id="tf"
                placeholder="e.g. 5 days, 2 weeks"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Hours per day</Label>
                <span className="text-sm font-medium">{hours}h</span>
              </div>
              <Slider
                min={1}
                max={10}
                step={0.5}
                value={[hours]}
                onValueChange={(v) => setHours(v[0])}
              />
            </div>

            <Button onClick={submit} disabled={loading} className="w-full gradient-primary text-primary-foreground shadow-elegant">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Planning...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Plan
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          {plan ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <Card className="shadow-card">
                <CardContent className="p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Overview
                  </div>
                  <p className="mt-1 text-sm leading-relaxed">{plan.overview}</p>
                </CardContent>
              </Card>
              {plan.days.map((day, di) => (
                <motion.div
                  key={di}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: di * 0.05 }}
                >
                  <Card className="shadow-card">
                    <CardContent className="p-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <div className="font-semibold">{day.day}</div>
                          <div className="text-xs text-muted-foreground">{day.focus}</div>
                        </div>
                      </div>
                      <ul className="mt-3 space-y-2">
                        {day.tasks.map((t, ti) => (
                          <li
                            key={ti}
                            className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3"
                          >
                            <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded bg-background ring-1 ring-border">
                              <Flag className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium">{t.title}</div>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className={priorityStyles[t.priority]}>
                                  {t.priority}
                                </Badge>
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {t.durationMinutes} min
                                </span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <Card className="shadow-card">
              <CardContent className="grid min-h-[420px] place-items-center p-6 text-sm text-muted-foreground">
                Your day-by-day plan will appear here.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
