# Zayra Customer Support Dashboard

Production-ready React + TypeScript dashboard for Zayra's support team.

## Quick Start

```bash
npm install
npm run dev        # dev server → http://localhost:3000
npm run build      # production build  (tsc + vite build)
npm run preview    # preview production build locally
npm run type-check # run tsc without emitting
```

## Stack

| Layer       | Tech                                     |
|-------------|------------------------------------------|
| Bundler     | **Vite 5**                               |
| UI          | React 18 + TypeScript 5                  |
| Styling     | Tailwind CSS 3 (JIT) + PostCSS           |
| Routing     | React Router v6                          |
| HTTP        | Axios (centralised in `services/api.ts`) |
| Fonts       | DM Sans + DM Mono (Google Fonts)         |

## Folder Structure

```
src/
├── pages/
│   ├── auth/
│   │   ├── Login.tsx          ← Login + "Skip for now"
│   │   └── Signup.tsx
│   ├── dashboard/
│   │   └── Dashboard.tsx      ← Main layout orchestrator
│   └── analytics/
│       └── Analytics.tsx      ← Analytics tab
│
├── components/
│   ├── ui/
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── ZayraLogo.tsx
│   ├── layout/
│   │   ├── Topbar.tsx         ← Theme toggle + logout
│   │   ├── TabBar.tsx         ← Desktop + mobile nav
│   │   ├── StatsRow.tsx
│   │   └── ProtectedRoute.tsx
│   ├── tickets/
│   │   ├── TicketCard.tsx
│   │   ├── TicketQueue.tsx
│   │   └── TicketDetail.tsx   ← Conversation + reply input
│   ├── agents/
│   │   └── AgentsOnline.tsx
│   └── charts/
│       ├── CategoryChart.tsx
│       └── CsatCard.tsx
│
├── hooks/
│   ├── useAuth.tsx            ← Auth context + mock login/signup
│   ├── useDashboard.ts        ← Ticket state management
│   └── useAnalytics.ts        ← Analytics computations
│
├── data/
│   └── mockData.ts            ← All static/mock data (one file)
│
├── services/
│   └── api.ts                 ← Axios instance + all API calls
│
├── schema/
│   └── index.ts               ← All TS interfaces & types
│
└── theme/
    └── ThemeContext.tsx        ← Light/Dark theme provider
```

## Theme

- Default: **Light**
- Toggle via the moon/sun icon in the Topbar
- Persisted to `localStorage` as `zayra-theme`
- Implemented via `.dark` CSS class on `<html>` + CSS custom properties

## Auth Flow

- `/login` → enter credentials → redirect to `/dashboard`
- `/login` → "Skip for now" → redirect to `/dashboard` (bypasses auth)
- `/signup` → same "Skip for now" option available
- Auth state managed in `useAuth` context (mocked, no real API calls)
- `<ProtectedRoute>` redirects unauthenticated users to `/login`

## Adding Real API Calls

Replace the mock delays in `hooks/useAuth.tsx` with calls to `services/api.ts`:

```typescript
// hooks/useAuth.tsx
const login = async (creds) => {
  const data = await authApi.login(creds); // ← real call
  localStorage.setItem('zayra-token', data.token);
  setState({ user: data.user, isAuthenticated: true, ... });
};
```

Set `REACT_APP_API_URL` in `.env` to point at your backend.
