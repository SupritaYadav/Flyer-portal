# End-to-End Frequent Flyer Portal

Ticket ENG-163087. A digital portal for floor staff to search, register and remove frequent flyer members.

## Scripts
| Command | What it does |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start the dev server |
| `npm test` | Run the Vitest suite |
| `npm run lint` | ESLint, zero warnings allowed |
| `npm run build` | Production build to `dist/` |

## Spec coverage
- **Happy path:** member list, immediate responses, consistent data shape (`src/lib/api.js`).
- **Empty state:** "No data found" message instead of a blank screen.
- **Bad connectivity:** `role="status"` loading indicator on load and during saves; error banner with Retry; data persisted locally.
- **Invalid input:** submission blocked, fields highlighted red with `aria-invalid` and linked error text, focus moves to the first bad field.
- **Accessibility:** labelled controls, semantic landmarks/table, visible focus rings, keyboard-only use, AA contrast.
- **Telemetry:** `[Analytics] User interacted with End-to-End Frequent Flyer Portal` logged after a completed register or remove.
- **Security:** `sanitize()` strips tags and control characters before any value enters state; React escapes output.
- **Design:** greys only (plus one error red), 16px/32px spacing steps.

## Deploy
Push to GitHub, then import the repo in Vercel or Netlify (build: `npm run build`, output: `dist`).
