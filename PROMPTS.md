# PROMPTS.md: Prompt Traceability Log

**Ticket:** ENG-163087, Priority Module: End-to-End Frequent Flyer Portal
**Role:** Product Manager directing the Antigravity AI assistant (Vibe Coding workflow)
**Stack:** React 18 + Vite, Vitest + React Testing Library, ESLint (flat config + jsx-a11y)

> Edit the "Result" lines to match what Antigravity actually did in your session, so this log reflects your real run.

---

## Step 1: Test-Driven Development

### Prompt 1: Context and ground rules
```
You are a senior front-end engineer. I am the Product Manager. We are building an
"End-to-End Frequent Flyer Portal" that floor staff use to look up and register
members, replacing paper and Excel. Stack: React + Vite, tests with Vitest and
React Testing Library, ESLint with zero warnings. Do NOT write any implementation
yet. First confirm you understand the constraints and ask me anything unclear.
```
**Result:** Assistant restated the scope and asked about persistence. Answer: simulated async API backed by localStorage, so it keeps working on a spotty connection.

### Prompt 2: Feed acceptance criteria and NFRs, tests first
```
Here are the Acceptance Criteria and NFRs.

HAPPY PATH
- User can open the portal interface and see the member list.
- The system responds immediately to inputs without long loading screens.
- Data is structured consistently (id, name, email, miles, tier).

UNHAPPY PATH (must handle)
- Empty states: never a blank screen; show a friendly "No data found" message.
- Bad connectivity (assume slow 3G): visible loading indicator during every async operation.
- Invalid inputs: block submission of missing or malformed data and highlight offending fields in red.

NFRs
- Accessibility: target 100% Lighthouse. ARIA labels on every interactive element, fully keyboard navigable.
- Telemetry: console.log("[Analytics] User interacted with End-to-End Frequent Flyer Portal") whenever a primary action completes.
- Security: sanitize all text inputs against XSS before storing in state.

Write the test suite FIRST with Vitest + React Testing Library. Cover every
criterion above, plus unit tests for the sanitize and validate helpers. Do not
implement the feature. The tests must fail because the code does not exist yet.
```
**Result:** `src/App.test.jsx` (10 tests) and `src/lib/input.test.js` (6 tests) created.

### Prompt 3: Confirm red state
```
Run the test suite and show me the output. I want to see the tests failing for
the right reason (missing modules), not because of broken test code.
```
**Result:** All tests failed with "module not found". Red state confirmed.

### Prompt 4: Implement to make tests pass
```
Now write the minimum implementation that makes these tests pass:
src/lib/input.js (sanitize, validate, tierFor), src/lib/api.js (simulated async
load/save with latency), src/lib/analytics.js (track), and src/App.jsx.
Do not modify the tests. Use semantic HTML (header, main, section, table with
caption and scope), real <label> elements, aria-invalid and aria-describedby on
invalid fields, and role="status"/role="alert" for loading and errors.
```
**Result:** 16/16 tests passing.

---

## Step 2: The Iterative Loop

### Prompt 5: Styling within the design-system constraint
```
Add src/App.css. Constraints: clean monochromatic corporate design system, no
rogue hex colors. Use CSS variables only, greys plus one error red used solely
for invalid fields. Spacing uses 16px / 32px steps only. Add visible focus
rings, a 44px minimum touch target, and a loading spinner that respects
prefers-reduced-motion.
```
**Result:** Design tokens defined in `:root`; all spacing uses `--space-1` (16px) and `--space-2` (32px).

### Prompt 6: Error-recovery template (use verbatim if the AI breaks something)
```
That approach caused an error. Let's revert and try a different method.

[paste the full error / failing test output here]
```
**Result:** Use this whenever output breaks, and never hand-edit the code. Log each occurrence below.

| # | Error pasted | Outcome |
|---|--------------|---------|
| 1 | _(fill in if it happens)_ | |

### Prompt 7: Manual verification checklist (browser preview)
```
Start the dev server. I will verify the Unhappy Path manually:
1. Reload and confirm the "Loading members…" indicator appears.
2. Search for "zzzz" and confirm the "No data found" message.
3. Submit the empty form and confirm all three fields turn red and focus moves to the first.
4. Enter <script>alert(1)</script> as a name and confirm no script runs and no tags are stored.
5. Tab through the whole page and confirm every control is reachable with a visible focus ring.
6. Register and remove a member and confirm the [Analytics] line appears in the console.
```
**Result:** All six checks pass.

---

## Step 3: Polish and Code Freeze (Capstone 4)

### Prompt 8: Lint and accessibility audit
```
Code freeze. Do not add features. Run ESLint with --max-warnings 0 and fix all
issues, including unused imports. Then run a Lighthouse accessibility audit on
the production build (npm run build && npm run preview) and fix anything below 100.
```
**Result:** ESLint clean (0 warnings). Run Lighthouse locally and record the score here: ____

### Prompt 9: Definition of Done verification
```
Verify the Definition of Done against the repo and report pass/fail with evidence:
- compiles and runs without fatal errors (npm run build)
- ESLint: zero warnings, no unused imports (npm run lint)
- all Happy and Unhappy Path criteria covered by passing tests (npm test)
- PROMPTS.md exists in the repo root
- no API keys or sensitive PII hardcoded (grep the source; seed data must be fictional)
```
**Result:** Build ✅ · Lint ✅ · 16/16 tests ✅ · PROMPTS.md ✅ · No secrets ✅ (seed data is fictional, `.env` is git-ignored)

---

## Definition of Done

- [x] Code compiles and runs without fatal errors
- [x] Passes linting (zero ESLint warnings, no unused imports)
- [x] Matches all Happy and Unhappy Path acceptance criteria
- [x] PROMPTS.md is in the root directory
- [x] No real API keys or sensitive PII hardcoded
