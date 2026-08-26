<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agora Eu Consigo

## Stack

- **Next.js 16.2.9** / React 19.2.4 / TypeScript 5
- **Tailwind CSS v4** (`@import "tailwindcss"` in CSS, not `@tailwind` directives)
- **ESLint 9** flat config (`eslint.config.mjs` with `eslint-config-next/core-web-vitals`)
- **No test framework** — no Jest, Playwright, Vitest, or Cypress
- **No typecheck script** — `tsc` works but is not in package.json scripts

## Commands

| Command | What it runs |
|---------|-------------|
| `npm run dev` | `next dev` (dev server on :3000) |
| `npm run build` | `next build` |
| `npm run lint` | `eslint` (flat config) |
| `npx tsc --noEmit` | Type-check manually (no script exists) |

Run order when relevant: `lint -> tsc --noEmit -> build`

## Architecture

Single-page **SPA** with client-side screen routing — not Next.js file-based routes:

- `src/app/page.tsx` — single entrypoint, switches between screens via component
- `src/app/api/agente/route.ts` — **only** API route (POST, calls Gemini `gemini-3.6-flash`)
- Screens live in `src/componentes/telas/` — not under `app/` — rendered conditionally in `page.tsx`
- `src/contexto/AppProvider.tsx` — global React Context (state + navigation + Nina agent dispatch)
- `src/lib/estado.ts` — app state (localStorage persistence, `agora-eu-consigo:estado` key, `ModuloId` union type)
- `src/lib/modulos.ts` — module config (colors, display names, layout order)
- `src/lib/conteudo.ts` — lesson content items (`Item` type with `copiar`/`responder` variants, keyed by `licaoId`)
- `src/lib/frases.ts` — catalog of static Nina phrases with prerecorded MP3 paths
- `src/lib/nina-prompt.ts` — Gemini system prompt for virtual assistant "Nina"

## Audio workflow

Three audio paths, priority order:
1. **Prerecorded MP3** — static phrases in `public/audios/`, played via `HTMLAudioElement`, referenced by `frases.ts`. Used for common interactions (boas-vindas, acertou, errou).
2. **Dynamic TTS** — Web Speech API `SpeechSynthesis` with `lang: 'pt-BR'`. Used for dynamic Nina responses without a prerecorded clip.
3. **Silent fallback** — if the API call fails, the app remains navigable via touch, Nina goes silent.

A click anywhere on screen unlocks autoplay-blocked audio on first `pointerdown`.

## Key conventions

- **Portuguese (pt-BR)** everywhere — UI text, comments, variable names, git messages
- Components are `.tsx`, utility libs are `.ts`, all in `src/`
- No app router pages beyond the single root — app uses a SPA pattern
- `@/*` path alias maps to `src/` (set in `tsconfig.json`)
- `BotaoVoltar` auto-hides on `inicial` screen; back stack is hardcoded in `BotaoVoltar.tsx`: `inicial ← modulos ← licoes ← atividade`
- `BotaoPerguntar` (mic button, bottom-right, global) auto-hides when `assistenteAtivo` is off or `SpeechRecognition` isn't supported

## AI Agent ("Nina")

- `POST /api/agente` calls `gemini-3.6-flash` via `@google/generative-ai`
- Requires `GOOGLE_API_KEY` in `.env.local` (free tier at aistudio.google.com)
- Agent uses tool-calling: `navegar_para`, `selecionar_modulo`, `selecionar_licao`, `destacar_elemento`, `soletrar`
- Speech out: Web Speech API `SpeechSynthesis` with `lang: 'pt-BR'`
- Speech in: `BotaoPerguntar.tsx` (global mic button) uses Web Speech API `SpeechRecognition`/`webkitSpeechRecognition` (`lang: 'pt-BR'`, single-shot, not continuous) — no type lib for this API, so it's hand-typed locally in that file. Not supported in all browsers (notably Firefox); the button hides itself when unsupported.
- The frontend sends `{ estado, evento }` and receives `{ fala, acoes }` — `evento` carries free-text; voice requests via `BotaoPerguntar` fold the transcript plus current `nav.tela`/`nav.moduloAtivo` into that string since `estado` alone doesn't include navigation position

## State & debugging

- State persisted to `localStorage` under key `agora-eu-consigo:estado`
- `?demo=1` loads a pre-filled demo state (2 lessons completed in alfabeto)
- `?reset=1` clears state back to initial
- `4 módulos` (alfabeto, silabas, numeros, calculos), each with `4 lições` that unlock sequentially on completion
