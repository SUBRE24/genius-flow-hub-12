export type HistoryKind = "email" | "notes" | "tasks";

export interface HistoryItem {
  id: string;
  kind: HistoryKind;
  title: string;
  content: string;
  createdAt: number;
}

const KEY = "ai-assistant.history";

export function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function saveHistoryItem(item: Omit<HistoryItem, "id" | "createdAt">): HistoryItem {
  const full: HistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  const list = [full, ...loadHistory()].slice(0, 100);
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("history-updated"));
  return full;
}

export function deleteHistoryItem(id: string) {
  const list = loadHistory().filter((i) => i.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("history-updated"));
}

export function clearHistory() {
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("history-updated"));
}
