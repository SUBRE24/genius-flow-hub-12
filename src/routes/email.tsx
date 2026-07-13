import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Copy, Loader2, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateEmail } from "@/lib/ai.functions";
import { saveHistoryItem } from "@/lib/history";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Nova AI" },
      {
        name: "description",
        content: "Draft professional emails in any tone with AI.",
      },
    ],
  }),
  component: EmailPage,
});

const tones = ["Professional", "Friendly", "Formal", "Casual", "Persuasive"] as const;

function EmailPage() {
  const fn = useServerFn(generateEmail);
  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState<(typeof tones)[number]>("Professional");
  const [keyPoints, setKeyPoints] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const submit = async () => {
    if (!recipient.trim() || !purpose.trim()) {
      toast.error("Recipient and purpose are required.");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const { content } = await fn({ data: { recipient, purpose, tone, keyPoints } });
      setResult(content);
      saveHistoryItem({
        kind: "email",
        title: `Email to ${recipient} — ${purpose.slice(0, 40)}`,
        content,
      });
      toast.success("Email generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard");
  };

  return (
    <AppShell title="Smart Email Generator" description="Draft polished emails in seconds">
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="shadow-card lg:col-span-2">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg gradient-primary text-primary-foreground">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold">Compose</div>
                <div className="text-xs text-muted-foreground">Fill in the details</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                placeholder="e.g. Sarah, my hiring manager"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                id="purpose"
                placeholder="e.g. Follow up on interview"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="key">Key points (optional)</Label>
              <Textarea
                id="key"
                rows={4}
                placeholder="Bullet points, dates, links..."
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
              />
            </div>

            <Button onClick={submit} disabled={loading} className="w-full gradient-primary text-primary-foreground shadow-elegant">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Email
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card lg:col-span-3">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-semibold">Generated email</div>
              {result && (
                <Button variant="outline" size="sm" onClick={copy}>
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              )}
            </div>
            {result ? (
              <motion.pre
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="whitespace-pre-wrap rounded-lg bg-muted/50 p-4 font-sans text-sm leading-relaxed"
              >
                {result}
              </motion.pre>
            ) : (
              <div className="grid min-h-[320px] place-items-center rounded-lg border border-dashed text-sm text-muted-foreground">
                Your email will appear here.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
