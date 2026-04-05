# Contributing

Thank you for helping improve the Smart Contract Generator for ResilientDB. This document explains how to contribute, where things live in the repo, and **suggested features and tracks** you can pick up—solo or as a small group.

For setup, environment variables, and deployment behavior, see [README.md](README.md).

---

## How to contribute

1. **Fork** the repository and create a branch. Examples: `feature/streaming-chat`, `fix/validator-pragma-edge-case`.
2. **Keep changes focused**: one logical change per pull request when possible. Large refactors are easier to review when split.
3. **Match existing style**: TypeScript strictness, React function components and hooks, Tailwind and component CSS in `src/components/ui/` (see nearby files for patterns).
4. **Test locally** before you open a PR:
   - `npm run lint`
   - `npm run build`
   - Run `npm run dev`, exercise the chatbot and any UI you touched.
5. **Describe the PR clearly**: what changed, why, and how a reviewer can verify (screenshots or short screen recording for UI changes).

For bigger roadmap items, open a **draft PR early** or an **issue** so others can coordinate and avoid duplicate work.

### Local development checklist

- Install dependencies: `npm install`.
- Copy [`.env.example`](.env.example) to `.env` in the project root and set `DEEPSEEK_API_KEY` (and optional `DEEPSEEK_BASE_URL`, `DEEPSEEK_MODEL`) so `/api/deepseek` works under `npm run dev`.
- The frontend calls **`/api/deepseek` only**; the key is never embedded in the Vite client bundle. After changing `.env`, restart the dev server.

---

## Where things live (project map)

| Area | Path | Role |
|------|------|------|
| App shell & routes | `src/App.tsx`, `src/Pages/` | Landing, chatbot page, 404. |
| Chat UI & state | `src/services/Chatbot.tsx`, `src/hooks/useMessages.ts` | Messages, sending prompts, displaying AI replies and code. |
| **Chat history (multi-session)** | `src/hooks/useHistory.ts`, `src/components/Sidebar.tsx`, `src/components/ChatItem.tsx` | Persisted chats in the browser (`localStorage`); switching threads, titles, legacy migration. |
| Templates | `src/templates/*.ts`, `src/components/TemplateSelector.tsx` | Starter Solidity snippets merged into prompts. |
| Prompts | `src/Prompts/FewshotPrompts.ts` | Few-shot and instruction text for generation. |
| Client → LLM | `src/services/deepseekService.ts` | `POST /api/deepseek` with messages; parses Solidity / JSON from responses. |
| Server proxy (shared) | `api/lib/deepseekForward.ts` | Forwards to DeepSeek using server env vars (lives under `api/` so Vercel bundles it). |
| Vercel handler | `api/deepseek.ts` | Production serverless entry that uses the shared forwarder. |
| Dev API wiring | `vite.config.ts` | Middleware that serves `/api/deepseek` in development. |
| Validation | `src/services/contractValidator.ts` | Heuristic checks on generated Solidity (not a full compiler). |
| JSON export UI | `src/components/JSONModal.tsx` | ResVault-style JSON from generated contracts. |

When you add a feature, prefer extending these modules rather than introducing parallel patterns unless there is a strong reason.

---

## Security note for production features

Do **not** put long-lived secrets in `VITE_*` variables for a public deployment—they are exposed in the browser bundle.

Today, DeepSeek traffic goes through **`/api/deepseek`**, with secrets in **`DEEPSEEK_*`** (see README). Any new integration that needs private keys, deployment credentials, or third-party API keys should follow the same idea: **browser → your server route → external API**, with secrets only in server-side environment variables.

---

## Suggested feature roadmap

The items below are **ideas**, not a fixed priority list. Each subsection includes a short **goal**, **where to start**, and **done when** criteria so you can self-scope a PR.

### High impact, clearly scoped

#### Streaming responses

- **Goal**: Show the model reply as it arrives (token or chunk stream) instead of one long loading state.
- **Where to start**: `src/services/deepseekService.ts` (fetch/stream parsing), `src/services/Chatbot.tsx` and `useMessages` for incremental updates. `api/lib/deepseekForward.ts` and `api/deepseek.ts` must forward streaming responses correctly (SSE or raw stream) and set appropriate headers.
- **Done when**: User sees text appear progressively; errors still surface clearly; non-streaming code paths can be removed or kept behind a simple flag if needed for debugging.

#### “Refine this contract” actions

- **Goal**: Quick actions on generated Solidity (e.g. “add events”, “tighten access control”, “simplify for ResilientDB”) that send a **follow-up** request including the current code as context.
- **Where to start**: `Chatbot.tsx` (UI affordances near code blocks), `deepseekService.ts` (a small helper that builds `messages` with `role: user` and the contract in the body), `FewshotPrompts.ts` if you want reusable instruction snippets.
- **Done when**: At least one refine action works end-to-end; prompts are safe (no accidental execution of user content as system instructions); loading and error states match the rest of the chat.

#### Real Solidity compilation (optional path)

- **Goal**: Treat “valid” as **compiles** where possible, not only `contractValidator` heuristics.
- **Where to start**: `contractValidator.ts` for how validation is consumed today. New work might be `solc` WASM in the browser, or a **small server route** (similar to `/api/deepseek`) that runs `solc` or calls a compilation API—keep API keys and heavy tooling off the client if they are sensitive.
- **Done when**: User gets explicit compiler errors/diagnostics; feature can be optional or gated so the app still works without the compiler endpoint.

#### LLM provider abstraction

- **Goal**: One interface (e.g. `completeChat(messages)`) with DeepSeek as the first implementation; room for OpenAI-compatible or other providers via config.
- **Where to start**: `deepseekService.ts`, `api/lib/deepseekForward.ts` (env-driven base URL already helps). There are unused **`ai` / `@ai-sdk/*`** dependencies in `package.json`—either wire them through the abstraction or remove them in a dedicated cleanup PR.
- **Done when**: Swapping provider is mostly configuration + one adapter; client code does not hard-code DeepSeek URLs.

### Product and ResilientDB ecosystem

#### Native deployment from the app

- **Goal**: Let users move from “generated JSON” to **deploy** without leaving the app, where the official stack allows it.
- **Where to start**: `JSONModal.tsx` and README links for ResVault / ResContract. You will need alignment with **current ResVault/ResContract/ResDB APIs** and a **security review**: signing keys and deployment secrets must not live in `VITE_*` or otherwise leak to the client.
- **Done when**: Clear deploy steps, status and error reporting in the UI, and documentation for what networks and auth modes are supported.

#### ResVault / ResContract guidance in-app

- **Goal**: A short panel or page: prerequisites, official doc links, and copy-paste-friendly payloads when full in-app deploy is not available.
- **Where to start**: New section on `LandingPage` or `ChatbotPage`, or a small dedicated route in `App.tsx`.
- **Done when**: A new contributor can follow the panel and complete deploy using external tools without hunting through chat logs.

#### Template expansion

- **Goal**: More parameterized templates (escrow, timelock, staking, etc.) and better discovery (search, tags).
- **Where to start**: `src/templates/index.ts` and existing template files; `TemplateSelector.tsx` for UX.
- **Done when**: New templates appear in the selector; prompts still produce coherent output when a template is selected.

#### Diff view for iterations

- **Goal**: When the user asks for changes, show a simple **before/after** or line-oriented diff between Solidity versions.
- **Where to start**: `useMessages.ts` / message shape (store previous code revision or derive from last assistant code block), `Chatbot.tsx` for rendering. A lightweight diff library or simple line split is enough for v1.
- **Done when**: User can compare two consecutive contract versions without leaving the thread.

### Accessibility, i18n, and polish

#### Accessibility pass

- **Goal**: Keyboard navigation, focus traps in modals, labels, ARIA where needed, usable contrast.
- **Where to start**: Radix components in `JSONModal` and dialogs; `Sidebar.tsx` and chat controls; run with keyboard only and a screen reader once.
- **Done when**: No regressions in lint; critical flows (open modal, send message, switch chat) work without a mouse.

#### Internationalization

- **Goal**: Extract user-visible strings and add a second locale as a template for future languages.
- **Where to start**: Top-level pages and `Chatbot.tsx`; pick a small i18n approach consistent with bundle size (e.g. JSON dictionaries + simple hook).
- **Done when**: At least English + one other locale switchable for main UI strings; contributors know where to add translations.

### Engineering hygiene

#### Automated tests

- **Goal**: Regression safety for pure logic.
- **Where to start**: Vitest (or similar) for `contractValidator.ts`, template `generateCode` functions in `src/templates/`, and any new parsers in `deepseekService.ts`.
- **Done when**: `npm test` (or documented script) runs in CI or locally with meaningful cases, not only smoke tests.

#### CI

- **Goal**: Every PR runs `lint`, `build`, and tests.
- **Where to start**: GitHub Actions workflow in `.github/workflows/` (create if missing).
- **Done when**: Failing lint/build/tests blocks merge according to repo policy; optional preview deploy documented in README if you add it.

#### Validator hardening

- **Goal**: Fewer false positives/negatives in `contractValidator.ts`.
- **Where to start**: Read `contractValidator.ts` and add tests for each fixed edge case.
- **Done when**: Documented behavior for tricky inputs (multiple pragmas, interfaces, libraries) and tests that lock it in.

---

## Suggested work tracks

Use these to divide work among contributors without overlapping too much.

| Track | Example focus |
|-------|----------------|
| **Frontend** | Streaming UI, refine actions, diff view, template UX, deployment wizard UI, a11y |
| **Backend / infra** | New server routes (compile proxy, deployment proxy), Vercel config, env and security reviews |
| **AI / prompts** | Few-shot and system prompts in `src/Prompts/`, provider abstraction, prompt safety |
| **Quality** | Tests, CI, validator improvements, dependency cleanup (`ai` / SDK packages) |

---

## Questions

Open an issue or discussion in this repository’s issue tracker if you are unsure where a change belongs or want feedback before investing a lot of time.

Again, thank you for contributing.
