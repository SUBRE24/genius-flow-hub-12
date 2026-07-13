import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Mail, ListTodo, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  loadHistory,
  deleteHistoryItem,
  clearHistory,
  type HistoryItem,
} from "@/lib/history";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "History — Nova AI" }] }),
  component: HistoryPage,
});

const kindMeta = {
  email: { label: "Email", icon: Mail, color: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  notes: { label: "Notes", icon: FileText, color: "bg-violet-500/15 text-violet-600 dark:text-violet-400" },
  tasks: { label: "Plan", icon: ListTodo, color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
} as const;

function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setItems(loadHistory());
    refresh();
    window.addEventListener("history-updated", refresh);
    return () => window.removeEventListener("history-updated", refresh);
  }, []);

  return (
    <AppShell
      title="History"
      description="Your recent AI generations"
      actions={
        items.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              clearHistory();
              toast.success("History cleared");
            }}
          >
            <Trash2 className="h-4 w-4" />
            Clear all
          </Button>
        )
      }
    >
      {items.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="grid min-h-[360px] place-items-center p-8 text-center">
            <div>
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold">No history yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Generate an email, summary, or plan to see it here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((it, i) => {
            const meta = kindMeta[it.kind];
            const open = openId === it.id;
            return (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Card className="shadow-card">
                  <CardContent className="p-4">
                    <button
                      className="flex w-full items-start gap-3 text-left"
                      onClick={() => setOpenId(open ? null : it.id)}
                    >
                      <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${meta.color}`}>
                        <meta.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{meta.label}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(it.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-1 truncate text-sm font-medium">{it.title}</div>
                      </div>
                    </button>
                    {open && (
                      <div className="mt-4 space-y-3">
                        <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-muted/50 p-3 font-sans text-xs leading-relaxed">
                          {it.content}
                        </pre>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(it.content);
                              toast.success("Copied");
                            }}
                          >
                            <Copy className="h-4 w-4" /> Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              deleteHistoryItem(it.id);
                              toast.success("Deleted");
                            }}
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
