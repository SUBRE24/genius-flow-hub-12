import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Moon, Sun, Trash2, User } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { clearHistory } from "@/lib/history";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Nova AI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [name, setName] = useState("");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setName(localStorage.getItem("user.name") ?? "");
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const saveName = () => {
    localStorage.setItem("user.name", name);
    toast.success("Saved");
  };

  const toggleTheme = (v: boolean) => {
    setIsDark(v);
    document.documentElement.classList.toggle("dark", v);
    localStorage.setItem("theme", v ? "dark" : "light");
  };

  return (
    <AppShell title="Settings" description="Personalize your workspace">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-accent-foreground">
                <User className="h-4 w-4" />
              </div>
              <div className="font-semibold">Profile</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <Button onClick={saveName}>Save</Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-accent-foreground">
                {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </div>
              <div className="font-semibold">Appearance</div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="text-sm font-medium">Dark mode</div>
                <div className="text-xs text-muted-foreground">
                  Toggle between light and dark theme
                </div>
              </div>
              <Switch checked={isDark} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card md:col-span-2">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-destructive/10 text-destructive">
                <Trash2 className="h-4 w-4" />
              </div>
              <div className="font-semibold">Data</div>
            </div>
            <p className="text-sm text-muted-foreground">
              Your history is stored locally in this browser. Clearing it cannot be undone.
            </p>
            <Button
              variant="destructive"
              onClick={() => {
                clearHistory();
                toast.success("History cleared");
              }}
            >
              <Trash2 className="h-4 w-4" />
              Clear all history
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
