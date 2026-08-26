# Agora eu consigo

Plataforma de alfabetização para adultos, com a assistente de voz **Nina**. Aplicativo web (SPA) que ensina letras, sílabas, números e contas através de exercícios simples guiados por voz e cor.

## Stack

- **Next.js 16.2.9** / React 19.2.4 / TypeScript 5
- **Tailwind CSS v4**
- **ESLint 9** (flat config)
- **@google/generative-ai** — assistente Nina, via Gemini
- Sem framework de testes (nenhum Jest/Playwright/Vitest/Cypress configurado)

## Como rodar

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie um arquivo `.env.local` na raiz com sua chave da API do Gemini (gratuita em [aistudio.google.com](https://aistudio.google.com)):

   ```
   GOOGLE_API_KEY=sua_chave_aqui
   ```

3. Rode o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Abra [http://localhost:3000](http://localhost:3000).

Sem a `GOOGLE_API_KEY`, o app continua navegável por toque — a Nina apenas fica em silêncio (fallback silencioso quando a chamada à API falha).

## Comandos

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Sobe o servidor de desenvolvimento (`next dev`, porta 3000) |
| `npm run build` | Build de produção (`next build`) |
| `npm run start` | Sobe o build de produção (`next start`) |
| `npm run lint` | Roda o ESLint |
| `npx tsc --noEmit` | Checa os tipos (não há script dedicado no `package.json`) |

Ordem recomendada antes de subir uma alteração: `lint` → `tsc --noEmit` → `build`.

## Parâmetros de URL úteis para debug

- `?demo=1` — carrega um estado pré-preenchido (2 lições concluídas em "alfabeto")
- `?reset=1` — limpa o estado salvo e volta ao início

O estado do usuário é persistido em `localStorage` sob a chave `agora-eu-consigo:estado`.

## Arquitetura

SPA de página única com roteamento de telas no cliente — **não** usa o roteamento por arquivos do Next.js além da rota raiz.

- `src/app/page.tsx` — entrypoint único, alterna entre telas conforme o estado de navegação
- `src/app/api/agente/route.ts` — única rota de API (`POST`), chama o Gemini para a Nina
- `src/componentes/telas/` — as telas do app (inicial, módulos, lições, atividade)
- `src/contexto/AppProvider.tsx` — contexto React global (estado, navegação e orquestração de fala/áudio da Nina)
- `src/lib/estado.ts` — modelo de estado do app (persistência em `localStorage`)
- `src/lib/modulos.ts` — configuração visual e de voz dos 4 módulos (alfabeto, sílabas, números, cálculos)
- `src/lib/conteudo.ts` — conteúdo dos exercícios de cada lição
- `src/lib/frases.ts` — catálogo de falas fixas da Nina, com áudio pré-gravado
- `src/lib/nina-prompt.ts` — system prompt do Gemini para a Nina

Cada um dos 4 módulos tem 4 lições, que se desbloqueiam sequencialmente à medida que são concluídas.

### Áudio da Nina

Três caminhos, em ordem de prioridade:

1. **Áudio pré-gravado** — falas fixas e comuns (boas-vindas, acertou, errou), servidas de `public/audios/` e catalogadas em `frases.ts`.
2. **TTS dinâmico** — Web Speech API (`SpeechSynthesis`, `pt-BR`) para respostas da Nina sem áudio pré-gravado.
3. **Fallback silencioso** — se a chamada à API falhar, o app segue navegável por toque, só sem a Nina.

### Nina como agente

`POST /api/agente` recebe `{ estado, evento }` e devolve `{ fala, acoes }`. A Nina age no app via tool-calling: `navegar_para`, `selecionar_modulo`, `selecionar_licao`, `destacar_elemento`, `soletrar`. Fala de entrada por voz usa `SpeechRecognition`/`webkitSpeechRecognition` (não suportado em todos os navegadores, notavelmente o Firefox).

## Convenções

- Português (pt-BR) em toda parte: UI, comentários, nomes de variáveis, mensagens de commit
- `@/*` aponta para `src/`
