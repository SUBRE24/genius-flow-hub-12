import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Copy, FileText, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { summarizeNotes } from "@/lib/ai.functions";
import { saveHistoryItem } from "@/lib/history";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Nova AI" },
      {
        name: "description",
        content: "Turn raw meeting notes into summaries and action items.",
      },
    ],
  }),
  component: MeetingsPage,
});

function renderMarkdown(md: string) {
  const lines = md.split("\n");
  const out: React.ReactNode[] = [];
  let list: React.ReactNode[] = [];
  const flush = () => {
    if (list.length) {
      out.push(
        <ul key={out.length} className="my-2 list-disc space-y-1 pl-5 text-sm">
          {list}
        </ul>,
      );
      list = [];
    }
  };
  const inline = (s: string) => {
    const parts = s.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith("**") && p.endsWith("**") ? (
        <strong key={i}>{p.slice(2, -2)}</strong>
      ) : (
        <span key={i}>{p}</span>
      ),
    );
  };
  for (const line of lines) {
    if (line.startsWith("## ")) {
      flush();
      out.push(
        <h3 key={out.length} className="mt-4 text-sm font-semibold uppercase tracking-wide text-primary">
          {line.slice(3)}
        </h3>,
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      list.push(<li key={list.length}>{inline(line.slice(2))}</li>);
    } else if (line.trim()) {
      flush();
      out.push(
        <p key={out.length} className="my-2 text-sm leading-relaxed">
          {inline(line)}
        </p>,
      );
    }
  }
  flush();
  return out;
}

function MeetingsPage() {
  const fn = useServerFn(summarizeNotes);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const submit = async () => {
    if (notes.trim().length < 10) {
      toast.error("Add more notes to summarize.");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const { content } = await fn({ data: { notes } });
      setResult(content);
      saveHistoryItem({
        kind: "notes",
        title: `Notes summary — ${new Date().toLocaleDateString()}`,
        content,
      });
      toast.success("Notes summarized");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Meeting Notes Summarizer" description="Extract key points, decisions, and action items">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg gradient-primary text-primary-foreground">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold">Raw notes</div>
                <div className="text-xs text-muted-foreground">Paste your meeting transcript or notes</div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={16}
                placeholder="Paste your meeting notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="text-xs text-muted-foreground">{notes.length} characters</div>
            </div>
            <Button onClick={submit} disabled={loading} className="w-full gradient-primary text-primary-foreground shadow-elegant">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Summarize
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-semibold">Summary</div>
              {result && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(result);
                    toast.success("Copied");
                  }}
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              )}
            </div>
            {result ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {renderMarkdown(result)}
              </motion.div>
            ) : (
              <div className="grid min-h-[400px] place-items-center rounded-lg border border-dashed text-sm text-muted-foreground">
                Your summary will appear here.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
