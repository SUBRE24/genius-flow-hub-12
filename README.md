# AI Productivity Assistant

A modern, responsive AI-powered productivity web app with three tools: **Smart Email Generator**, **Meeting Notes Summarizer**, and **AI Task Planner**. Built with TanStack Start, React 19, TypeScript, Tailwind CSS v4, Framer Motion, and the Lovable AI Gateway.

## Features

- **Smart Email Generator** — Draft professional emails from a recipient, purpose, tone, and key points.
- **Meeting Notes Summarizer** — Turn raw notes into structured markdown (Summary, Key Points, Decisions, Action Items).
- **AI Task Planner** — Convert a goal + timeframe + daily availability into a day-by-day schedule.
- **Dashboard Layout** — Collapsible sidebar, active-page highlighting, responsive (desktop / tablet / mobile).
- **Dark & Light Themes** — Toggle from Settings.
- **History** — Recent generations persisted in `localStorage`.

## Tech Stack

- React 19 + TypeScript
- TanStack Start (Vite 7)
- Tailwind CSS v4
- Framer Motion
- Lucide React icons
- Lovable AI Gateway (Gemini)

## Getting Started

```bash
bun install
bun dev
```

The app runs at `http://localhost:8080`.

### Environment

The AI tools use the Lovable AI Gateway. Set:

```
LOVABLE_API_KEY=your_key_here
```

When running inside Lovable Cloud, this is provided automatically.

## Project Structure

```
src/
├── components/       # App shell, sidebar, theme toggle, UI primitives
├── lib/
│   ├── ai.functions.ts  # Server functions calling the AI gateway
│   └── history.ts       # localStorage history helpers
├── routes/           # File-based routes (TanStack Router)
│   ├── __root.tsx
│   ├── index.tsx     # Dashboard
│   ├── email.tsx
│   ├── meetings.tsx
│   ├── tasks.tsx
│   ├── history.tsx
│   └── settings.tsx
└── styles.css        # Tailwind v4 theme tokens
```

## Scripts

- `bun dev` — start dev server
- `bun run build` — production build
- `bun run typecheck` — TypeScript check

## Deployment

Deploy directly from Lovable, or self-host the built output on any platform that supports a Node/Edge runtime.

## License

MIT
