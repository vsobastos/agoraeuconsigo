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
| `npm run start` | `next start` (serves the production build) |
| `npm run lint` | `eslint` (flat config) |
| `npx tsc --noEmit` | Type-check manually (no script exists) |

Run order when relevant: `lint -> tsc --noEmit -> build`

## Architecture

Single-page **SPA** with client-side screen routing — not Next.js file-based routes:

- `src/app/page.tsx` — single entrypoint, switches between screens via `nav.tela`
- `src/app/api/agente/route.ts` — **only** API route (POST, calls Gemini `gemini-3.6-flash`)
- Screens live in `src/componentes/telas/` — not under `app/` — rendered conditionally in `page.tsx`
- `src/contexto/AppProvider.tsx` — global React Context (lesson state + navigation + Nina agent dispatch + TTS/audio playback)
- `src/contexto/AuthProvider.tsx` — local device-identity Context (profile list + active session), independent of `AppProvider`
- `src/lib/estado.ts` — app/lesson state (localStorage persistence, `agora-eu-consigo:estado` key, `ModuloId` union type)
- `src/lib/perfis.ts` — profile model (avatars, access numbers, similar-name lookup), localStorage (`agora-eu-consigo:perfis`) + sessionStorage (`agora-eu-consigo:sessao`) persistence
- `src/lib/modulos.ts` — module config (colors, display names, layout order)
- `src/lib/conteudo.ts` — lesson content items (`Item` type with `copiar`/`responder` variants, keyed by `licaoId`)
- `src/lib/frases.ts` — catalog of static Nina phrases with prerecorded MP3 paths (lesson flow **and** identity flow; MP3 name = phrase id)
- `src/lib/frases-auth.ts` — only the identity-flow phrases with a dynamic name/number (`FALAS_AUTH`), always spoken by TTS
- `src/lib/nina-prompt.ts` — Gemini system prompt for virtual assistant "Nina"
- `src/lib/nome.ts` — spoken-name normalization + Levenshtein fuzzy match, used to tolerate speech-recognition errors when looking up a profile by name
- `src/lib/reconhecimento-voz.ts` — hand-typed `SpeechRecognition`/`webkitSpeechRecognition` types (no official type lib) + browser-support detection
- `src/lib/voz.ts` — `ouvir()`: promise wrapper for a single speech-recognition capture with timeout; never rejects, always resolves to a transcript or a typed `erro`

`EstadoApp` (lesson progress) and `Perfil` (device identity) are **deliberately decoupled**: progress is per-device and shared across all profiles on that device, not per-profile.

## Audio workflow

Three audio paths, priority order:
1. **Prerecorded MP3** — static phrases in `public/audios/`, played via `HTMLAudioElement`, referenced by `frases.ts`. Used for common interactions (screen intros, acertou, errou, identity-flow prompts).
2. **Dynamic TTS** — Web Speech API `SpeechSynthesis` with `lang: 'pt-BR'`. Used for dynamic Nina responses without a prerecorded clip.
3. **Silent fallback** — if the API call fails, the app remains navigable via touch, Nina goes silent.

A click anywhere on screen unlocks autoplay-blocked audio on first `pointerdown`.

## Identity flow ("who's using the device")

Runs before the lesson SPA, gated by `AuthProvider`/`AppProvider` on mount (see `AppProvider.tsx` effect that picks the first `nav.tela`). Screens (`src/componentes/telas/`): `TelaConsentimento` → `TelaPrimeiroAcesso` → `TelaEntrada` / `TelaPerfis` → `TelaMeusDados`. Three flows, all voice-first with a touch fallback:

1. **Fluxo 1 — first access** (`TelaPrimeiroAcesso`): captures name by voice, confirms it, generates an access number + avatar (`criarPerfil`).
2. **Fluxo 2 — voice sign-in** (`TelaEntrada`): asks for name, fuzzy-matches against existing profiles (`encontrarPerfisPorNome`, tolerates recognition error), confirms via 4-digit access number typed on `TecladoNumerico`.
3. **Fluxo 3 — touch sign-in** (`TelaPerfis`): tap-a-card grid, always reachable; where voice flows fall back to after `MAX_TENTATIVAS` (2) failed attempts, no mic support, or mic permission denied.

`TELAS_ACESSO` in `page.tsx` hides the global `BotaoPerguntar` (free-form "ask Nina" mic) on these screens so it isn't confused with the name-capture mic. A profile only affects identity/display (name, avatar, access number) — it has **no** effect on lesson state; progress in `EstadoApp` is shared per-device across all profiles.

## Key conventions

- **Portuguese (pt-BR)** everywhere — UI text, comments, variable names, git messages
- Components are `.tsx`, utility libs are `.ts`, all in `src/`
- No app router pages beyond the single root — app uses a SPA pattern
- `@/*` path alias maps to `src/` (set in `tsconfig.json`)
- `BotaoVoltar` auto-hides on screens with no entry in its back stack (`modulos`, `primeiro_acesso`, `entrada`, `consentimento`); stack is hardcoded in `BotaoVoltar.tsx`: `modulos ← licoes ← atividade`, `entrada ← perfis`, `modulos ← meus_dados`
- There is no welcome/home screen: after sign-in (or on load with a valid session) `irParaInicio()` in `AppProvider` sends new users (`usuarioNovo`) to `modulos` and returning users straight to `licoes` of `ultimoModulo`
- `BotaoPerguntar` (mic button, bottom-right, global) auto-hides when `assistenteAtivo` is off, `SpeechRecognition` isn't supported, or the current screen is in `TELAS_ACESSO`

## AI Agent ("Nina")

- `POST /api/agente` calls `gemini-3.6-flash` via `@google/generative-ai`
- Requires `GOOGLE_API_KEY` in `.env.local` (free tier at aistudio.google.com)
- Agent uses tool-calling: `navegar_para`, `selecionar_modulo`, `selecionar_licao`, `destacar_elemento`, `soletrar`
- Speech out: Web Speech API `SpeechSynthesis` with `lang: 'pt-BR'`
- Speech in: `BotaoPerguntar.tsx` (global mic button) uses Web Speech API `SpeechRecognition`/`webkitSpeechRecognition` (`lang: 'pt-BR'`, single-shot, not continuous) via `src/lib/reconhecimento-voz.ts` (no official type lib for this API, so it's hand-typed there and shared with the identity flow's `voz.ts`). Not supported in all browsers (notably Firefox); the button hides itself when unsupported.
- The frontend sends `{ estado, evento }` and receives `{ fala, acoes }` — `evento` carries free-text; voice requests via `BotaoPerguntar` fold the transcript plus current `nav.tela`/`nav.moduloAtivo` into that string since `estado` alone doesn't include navigation position

## State & debugging

- Lesson state persisted to `localStorage` under key `agora-eu-consigo:estado`; profiles under `agora-eu-consigo:perfis`; active session under `sessionStorage` key `agora-eu-consigo:sessao` (tab-scoped, not shared with lesson state)
- `?demo=1` loads a pre-filled demo state (2 lessons completed in alfabeto)
- `?reset=1` resets **only** lesson state (`EstadoApp`) — profiles and the session are untouched; to re-test the identity flow from scratch, clear the `agora-eu-consigo:perfis` localStorage key (no profiles → app opens on `consentimento`; profiles but no valid session → `entrada`)
- `4 módulos` (alfabeto, silabas, numeros, calculos), each with `4 lições` that unlock sequentially on completion
