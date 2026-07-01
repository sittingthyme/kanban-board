# Flowboard — Kanban Task Board

A polished Kanban-style task board built for the Next Play Games internship assessment. Users can create tasks, drag them across columns, assign team members, tag with labels, and comment on tasks — all backed by Supabase with guest (anonymous) authentication and Row Level Security.

## Live Demo

> Deploy to Vercel and add your URL here before submitting.

`https://your-app.vercel.app`

## GitHub Repository

> Push to GitHub and add your repo URL here before submitting.

`https://github.com/your-username/kanban-board`

## Features

### Required
- Kanban board with **To Do**, **In Progress**, **In Review**, **Done** columns
- Drag-and-drop task movement with Supabase persistence
- Guest accounts via Supabase anonymous auth
- Row Level Security (RLS) on all tables
- Task creation with title, description, priority, and due date
- Loading, empty, and error states
- Responsive layout with horizontal scroll on mobile

### Advanced (implemented)
- **Team members & assignees** — create team members, assign to tasks, show avatars on cards
- **Labels / tags** — create custom labels, assign multiple per task, filter board by label
- **Task comments** — comment thread in task detail panel with relative timestamps

### Polish
- Search tasks by title
- Priority indicators and due-date badges (overdue / due soon)
- Dark, Linear-inspired UI

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4
- **Drag-and-drop:** @dnd-kit
- **Backend:** Supabase (Postgres + Auth)
- **Hosting:** Vercel (recommended)

## Local Setup

### Prerequisites
- Node.js 18+
- A free [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
git clone https://github.com/your-username/kanban-board.git
cd kanban-board
npm install
```

### 2. Configure Supabase

1. Create a new Supabase project
2. Go to **Authentication → Providers** and enable **Anonymous sign-in**
3. Open the **SQL Editor** and run the full contents of [`supabase/schema.sql`](supabase/schema.sql)

### 3. Environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Use only the **anon (public) key** — never commit or expose the service role key.

### 4. Run locally

```bash
npm run dev
```

Open http://localhost:5173

### 5. Build for production

```bash
npm run build
npm run preview
```

## Deploy to Vercel

1. Push the repo to GitHub
2. Import the project at [vercel.com](https://vercel.com)
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

## Database Schema

See [`supabase/schema.sql`](supabase/schema.sql) for the complete schema including RLS policies.

### Tables
| Table | Purpose |
|-------|---------|
| `tasks` | Core task data (title, status, priority, due date, position) |
| `team_members` | User's team roster for assignees |
| `task_assignees` | Many-to-many task ↔ member |
| `labels` | Custom label definitions |
| `task_labels` | Many-to-many task ↔ label |
| `comments` | Task comment thread |

## Security

- Anonymous auth creates a unique guest session per browser
- RLS ensures users only access their own data
- Only the Supabase anon key is used client-side
- `.env.local` is gitignored

## Tradeoffs & Future Improvements

- **Client-side filtering** for search and labels — simpler and fast for small boards; would move to server-side queries at scale
- **No activity log** — skipped to focus on three strong advanced features within time budget
- **No realtime subscriptions** — refetch-on-mutation is sufficient; Supabase Realtime would be a natural next step
- **Anonymous sessions** — clearing browser storage creates a new guest; account linking could be added later

## License

MIT
