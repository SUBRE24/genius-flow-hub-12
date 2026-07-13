import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, FileText, ListTodo, ArrowRight, Sparkles, Zap, Clock } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const tools = [
  {
    to: "/email" as const,
    icon: Mail,
    title: "Smart Email Generator",
    desc: "Draft polished emails in any tone in seconds.",
    hue: "from-blue-500/20 to-indigo-500/20",
  },
  {
    to: "/meetings" as const,
    icon: FileText,
    title: "Meeting Notes Summarizer",
    desc: "Turn raw notes into summaries, decisions & action items.",
    hue: "from-violet-500/20 to-fuchsia-500/20",
  },
  {
    to: "/tasks" as const,
    icon: ListTodo,
    title: "AI Task Planner",
    desc: "Break down goals into a realistic, prioritized schedule.",
    hue: "from-emerald-500/20 to-teal-500/20",
  },
];

const stats = [
  { icon: Zap, label: "AI-powered", value: "3 tools" },
  { icon: Clock, label: "Avg. save", value: "~45 min / task" },
  { icon: Sparkles, label: "Model", value: "Gemini 3 Flash" },
];

function Dashboard() {
  return (
    <AppShell title="Dashboard" description="Your AI productivity workspace">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl gradient-primary p-6 shadow-elegant sm:p-10"
      >
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-black/10 blur-3xl" />
        <div className="relative max-w-2xl text-primary-foreground">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Welcome back
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Work smarter with your AI copilot
          </h1>
          <p className="mt-3 text-sm opacity-90 sm:text-base">
            Delegate the busywork. Nova drafts emails, summarizes meetings, and plans
            your day — so you can focus on what matters.
          </p>
        </div>
      </motion.section>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * i }}
          >
            <Card className="shadow-card">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {s.label}
                  </div>
                  <div className="truncate text-sm font-semibold">{s.value}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">Your tools</h2>
        <p className="text-sm text-muted-foreground">
          Pick a workflow to get started.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {tools.map((t, i) => (
            <motion.div
              key={t.to}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 * i }}
            >
              <Link to={t.to} className="group block h-full">
                <Card className="relative h-full overflow-hidden shadow-card transition hover:-translate-y-0.5 hover:shadow-elegant">
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.hue} opacity-60`}
                  />
                  <CardContent className="relative flex h-full flex-col p-6">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-background/80 shadow-card ring-1 ring-border">
                      <t.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mt-4 font-semibold tracking-tight">{t.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
                    <div className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Open
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
