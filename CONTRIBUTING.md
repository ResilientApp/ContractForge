# Contributing

Thank you for helping improve the Smart Contract Generator for ResilientDB. This document explains how to contribute and lists **suggested features and tracks** you can pick up—solo or as a small group.

For setup, configuration, and architecture overview, see [README.md](README.md).

## How to contribute

1. **Fork** the repository and create a branch: `feature/short-description` or `fix/issue-description`.
2. **Keep changes focused**: one logical change per pull request when possible.
3. **Match existing style**: TypeScript, React patterns, Tailwind/CSS conventions used in nearby files.
4. **Test locally**: `npm run lint` and `npm run build` should pass before you open a PR.
5. **Describe the PR clearly**: what changed, why, and how to verify (screenshots for UI changes help).

If you are working on a larger item from the roadmap below, consider opening a **draft PR early** or an **issue** first so others can coordinate.

---

## Security note for production features

Any feature that calls external APIs (LLMs, ResilientDB, ResVault, etc.) from a **publicly deployed** app should **not** put long-lived secrets in `VITE_*` variables—they are embedded in client bundles. Prefer server or serverless routes (for example on Vercel) that read non-`VITE_` environment variables and proxy requests from the browser.

---

## Suggested feature roadmap

The items below are **ideas**, not a fixed priority list. Pick what fits your skills and interests.

### High impact, clearly scoped

| Idea | Description |
|------|-------------|
| **Streaming responses** | Stream model tokens into the chat instead of a single loading state, for better perceived latency and a modern chat feel. |
| **Chat sessions and local history** | Persist threads with `localStorage` or IndexedDB: named sessions, resume, export as Markdown or a small archive. No backend required for a first version. |
| **“Refine this contract” actions** | Buttons on generated code: e.g. add events, tighten access control, simplify for ResilientDB, explain a function—each sends a follow-up prompt with the current Solidity as context. |
| **Real Solidity compilation (optional path)** | Integrate `solc` (WASM or a small backend) so “valid Solidity” means **compiles**, not only regex checks. Can live behind an optional API to keep the static frontend simple. |
| **LLM provider abstraction** | Unify DeepSeek behind an interface; support additional providers via configuration. Remove or wire up unused `ai` / `@ai-sdk` dependencies in `package.json`. |
| **Server-side API proxy** | Move LLM calls to a server or serverless function so API keys are not shipped to the browser on public deployments. |

### Product and ResilientDB ecosystem

| Idea | Description |
|------|-------------|
| **Native deployment from the app** | Today users download `.sol` and ResVault-style JSON, then deploy with **ResVault** and **ResContract** against **ResDB** outside this UI. Add **first-class deployment flows** inside the web app: e.g. configure endpoint / network / credentials (stored securely), submit generated JSON (and related metadata) through the same toolchain ResVault and ResContract use, and show deployment status, transaction or contract identifiers, and errors in the UI. Sub-ideas: a “Deploy” step after JSON generation; optional wallet or API-key auth depending on official ResilientDB deployment docs; dry-run or validate-before-deploy; link out to explorers or dashboards where applicable. **Requires** alignment with current ResVault/ResContract APIs and security review so secrets never leak client-side. |
| **ResVault / ResContract integration docs in-app** | Short guided panel or page: prerequisites, links to official docs, and copy-paste commands or payloads when full in-app deployment is not yet implemented. |
| **Template expansion** | More parameterized templates (escrow, timelock, staking, etc.), search/tags in the template selector. |
| **Diff view for iterations** | When the user asks for changes, show a simple before/after or line diff between Solidity versions. |

### Accessibility, i18n, and polish

| Idea | Description |
|------|-------------|
| **Accessibility pass** | Keyboard focus in modals, labels, ARIA where needed, contrast checks. |
| **Internationalization** | Extract user-visible strings; add a second locale as a template for contributors. |

### Engineering hygiene

| Idea | Description |
|------|-------------|
| **Automated tests** | Add Vitest (or similar) for `contractValidator`, template `generateCode`, and prompt/response helpers. |
| **CI** | Run `lint`, `build`, and tests on pull requests; optional preview deployments. |
| **Validator hardening** | Review `contractValidator.ts` for edge cases and incorrect branches; add regression tests. |

---

## Suggested work tracks

Use these to divide work among contributors without overlapping too much.

| Track | Example focus |
|-------|----------------|
| **Frontend** | Streaming UI, session history, diff view, template UX, deployment wizard UI |
| **Backend / infra** | API proxy for LLMs, optional `solc` service, **secure deployment proxy** for ResVault/ResContract if keys or signed requests must stay server-side |
| **AI / prompts** | Refine actions, few-shot improvements in `src/Prompts/`, provider abstraction |
| **Quality** | Tests, CI, accessibility, dependency cleanup |

---

## Questions

Open an issue or discussion in this repository’s issue tracker if you are unsure where a change belongs or want feedback before investing a lot of time.

Again, thank you for contributing.
