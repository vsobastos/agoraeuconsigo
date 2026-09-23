'use client';
import {
    createContext, useContext, useEffect, useRef, useState, useCallback,
} from 'react';
import {
    EstadoApp, ModuloId, carregarEstado, salvarEstado, estadoInicial, estadoDemo,
} from '@/lib/estado';
import { FRASES } from '@/lib/frases';
import { carregarPerfis, lerIdSessao } from '@/lib/perfis';

export type Tela =
    | 'consentimento' | 'primeiro_acesso' | 'entrada' | 'perfis' | 'meus_dados'
    | 'modulos' | 'licoes' | 'atividade';

/** Estado de navegação client-side (não persistido) das telas da SPA. */
interface Navegacao {
    tela: Tela;
    moduloAtivo: ModuloId | null;
    licaoAtiva: string | null;
    destaque: string | null;
    /**
     * `false` quando se volta para as lições após terminar uma atividade —
     * nesse caso a introdução da tela já foi ouvida e não deve repetir.
     */
    anunciarLicoes: boolean;
}

/**
 * Para onde o app vai depois do acesso (ou ao abrir com sessão válida): quem
 * é novo escolhe uma área; quem volta cai direto nas lições da última área.
 */
function destinoInicio(estado: EstadoApp): Pick<Navegacao, 'tela' | 'moduloAtivo'> {
    if (estado.usuarioNovo) return { tela: 'modulos', moduloAtivo: null };
    return { tela: 'licoes', moduloAtivo: estado.ultimoModulo ?? 'alfabeto' };
}

/** Uma chamada de ferramenta retornada pelo agente Nina (ver `/api/agente`). */
interface Acao { ferramenta: string; args: Record<string, unknown>; }

interface Contexto {
    estado: EstadoApp;
    nav: Navegacao;
    pronto: boolean;
    abrirModulo: (m: ModuloId, anunciar?: boolean) => void;
    abrirLicao: (id: string) => void;
    irPara: (t: Tela) => void;
    /** Leva ao início do app depois do acesso — ver {@link destinoInicio}. */
    irParaInicio: () => void;
    aplicarEstado: (novo: EstadoApp) => void;
    dispararEvento: (evento: string, fraseId?: string) => Promise<void>;
    pararFala: () => void;
    /** Fala um texto dinâmico via TTS, sem passar pelo agente Gemini — usada pelo fluxo de acesso. */
    falar: (texto: string) => Promise<void>;
    /** Toca um áudio pré-gravado do catálogo, sem passar pelo agente Gemini — usada pelo fluxo de acesso. */
    tocarAudio: (caminho: string) => Promise<void>;
}

const Ctx = createContext<Contexto | null>(null);

/** Hook de acesso ao contexto global do app. Deve ser usado dentro de {@link AppProvider}. */
export const usarApp = () => {
    const c = useContext(Ctx);
    if (!c) throw new Error('usarApp fora do AppProvider');
    return c;
};

/**
 * Provider raiz do app: mantém o estado persistido (`EstadoApp`), o estado de
 * navegação client-side e a orquestração de fala/áudio da assistente Nina.
 * Renderiza `null` até o estado ser carregado do `localStorage` no mount.
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
    const [estado, setEstado] = useState<EstadoApp | null>(null);
    const [nav, setNav] = useState<Navegacao>({
        tela: 'modulos', moduloAtivo: null, licaoAtiva: null, destaque: null, anunciarLicoes: true,
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        let carregado: EstadoApp;
        if (params.get('demo') === '1') {
            carregado = estadoDemo();
            salvarEstado(carregado);
        } else if (params.get('reset') === '1') {
            carregado = estadoInicial();
            salvarEstado(carregado);
        } else {
            carregado = carregarEstado();
        }
        setEstado(carregado);

        // decide a primeira tela já nesta mesma passada — se esperasse um efeito
        // separado, outra tela chegaria a montar (e a Nina a falar) antes da troca
        const idSessao = lerIdSessao();
        const perfis = carregarPerfis();
        const temSessaoValida = idSessao !== null && perfis.some((p) => p.id === idSessao);
        if (temSessaoValida) {
            const destino = destinoInicio(carregado);
            setNav((n) => ({ ...n, ...destino }));
        } else {
            const telaAcesso: Tela = perfis.length > 0 ? 'entrada' : 'consentimento';
            setNav((n) => ({ ...n, tela: telaAcesso }));
        }
    }, []);

    const aplicarEstado = useCallback((novo: EstadoApp) => {
        setEstado(novo);
        salvarEstado(novo);
    }, []);

    /** Áudio (gravado ou TTS) atualmente em reprodução — a Nina só fala uma coisa por vez. */
    const audioAtualRef = useRef<HTMLAudioElement | null>(null);
    /** Callback que libera quem está esperando a fala atual terminar (ver `dispararEvento`), quando ela é cortada antes de acabar. */
    const liberarEsperaRef = useRef<(() => void) | null>(null);

    /**
     * Interrompe imediatamente qualquer fala em andamento (TTS ou áudio gravado)
     * e libera quem estava esperando por ela.
     */
    const pararFala = useCallback(() => {
        if (typeof window === 'undefined') return;
        window.speechSynthesis?.cancel();
        audioAtualRef.current?.pause();
        // solta a referência: sem isso, o "destrava áudio" no próximo toque
        // acha esse áudio pausado e o retoma fora de contexto (ex: já noutra tela)
        audioAtualRef.current = null;
        liberarEsperaRef.current?.();
        liberarEsperaRef.current = null;
    }, []);

    /**
     * Fala um texto dinâmico via TTS (Web Speech API).
     *
     * @returns Promise que só resolve quando a fala termina de verdade, para
     * que quem chamar possa esperar o áudio acabar antes de seguir em frente.
     */
    const falar = useCallback((texto: string): Promise<void> => {
        if (typeof window === 'undefined' || !window.speechSynthesis || !texto) return Promise.resolve();
        pararFala();
        return new Promise<void>((resolve) => {
            const terminar = () => { liberarEsperaRef.current = null; resolve(); };
            liberarEsperaRef.current = terminar;
            const u = new SpeechSynthesisUtterance(texto);
            u.lang = 'pt-BR';
            u.onend = terminar;
            u.onerror = terminar;
            window.speechSynthesis.speak(u);
        });
    }, [pararFala]);

    /**
     * Toca um áudio pré-gravado (frases fixas do catálogo em `frases.ts`) em
     * vez de gerar a fala por TTS.
     *
     * @returns Promise que resolve quando o áudio termina de tocar.
     */
    const tocarAudio = useCallback((caminho: string): Promise<void> => {
        if (typeof window === 'undefined') return Promise.resolve();
        pararFala();
        const audio = new Audio(caminho);
        audioAtualRef.current = audio;
        return new Promise<void>((resolve) => {
            const terminar = () => { liberarEsperaRef.current = null; resolve(); };
            liberarEsperaRef.current = terminar;
            audio.addEventListener('ended', terminar, { once: true });
            // autoplay sem gesto do usuário é bloqueado pelo navegador — o efeito abaixo
            // retenta no primeiro toque na tela; aqui não travamos quem está esperando
            audio.play().catch(terminar);
        });
    }, [pararFala]);

    /** Primeiro toque na tela "destrava" o áudio: retoma o que ficou bloqueado por autoplay. */
    useEffect(() => {
        const retomarAudioBloqueado = () => {
            const pendente = audioAtualRef.current;
            if (pendente && pendente.paused && !pendente.ended) {
                pendente.play().catch(() => {});
            }
        };
        window.addEventListener('pointerdown', retomarAudioBloqueado);
        return () => window.removeEventListener('pointerdown', retomarAudioBloqueado);
    }, []);

    /** Soletra uma palavra em voz alta, uma letra de cada vez, em ritmo lento. */
    const soletrar = useCallback((palavra: string) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;
        pararFala();
        for (const letra of palavra.toUpperCase()) {
            const u = new SpeechSynthesisUtterance(letra);
            u.lang = 'pt-BR';
            u.rate = 0.7;
            window.speechSynthesis.speak(u);
        }
    }, [pararFala]);

    /** Aplica no estado de navegação uma ação de ferramenta retornada pelo agente Nina. */
    const executarAcao = useCallback((acao: Acao) => {
        const a = acao.args;
        switch (acao.ferramenta) {
            case 'navegar_para':
                setNav((n) => ({ ...n, tela: a.tela as Tela })); break;
            case 'selecionar_modulo':
                setNav((n) => ({ ...n, moduloAtivo: a.modulo as ModuloId, tela: 'licoes', anunciarLicoes: true })); break;
            case 'selecionar_licao':
                setNav((n) => ({ ...n, licaoAtiva: a.licaoId as string, tela: 'atividade' })); break;
            case 'destacar_elemento':
                setNav((n) => ({ ...n, destaque: a.elementoId as string })); break;
            case 'soletrar':
                soletrar(a.palavra as string); break;
        }
    }, [soletrar]);

    /**
     * Notifica o agente Nina (`POST /api/agente`) sobre um evento do app —
     * navegação, acerto, erro, pedido de ajuda — e executa a fala e as ações
     * de ferramenta que ele retornar. Se `fraseId` corresponder a uma frase do
     * catálogo, toca o áudio pré-gravado em vez de esperar a fala dinâmica.
     * Não faz nada se a assistente estiver desligada. Falhas na chamada à API
     * são silenciosas: o app segue navegável por toque, só sem a Nina.
     *
     * @param evento descrição em texto livre do que aconteceu, enviada ao agente
     * @param fraseId id opcional de uma frase pré-gravada em `frases.ts`
     * @returns Promise que só resolve quando a Nina termina de falar, para que
     * quem chamar possa esperar antes de avançar (ex.: só trocar de exercício
     * depois que o áudio de "acertou" tiver acabado de tocar).
     */
    const dispararEvento = useCallback(async (evento: string, fraseId?: string) => {
        if (!estado || !estado.assistenteAtivo) return;
        const frase = fraseId ? FRASES[fraseId] : undefined;
        let falaConcluida: Promise<void> = Promise.resolve();
        if (frase) falaConcluida = tocarAudio(frase.audio);
        try {
            const r = await fetch('/api/agente', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado, evento }),
            });
            const { fala, acoes } = await r.json();
            if (!frase) falaConcluida = falar(fala); // sem áudio gravado: usa a fala dinâmica da Nina
            (acoes as Acao[]).forEach(executarAcao);
        } catch {
            /* API caiu: a tela segue navegável no toque, sem a Nina */
        }
        await falaConcluida;
    }, [estado, falar, tocarAudio, executarAcao]);

    /**
     * Navega para uma tela. Sempre interrompe a fala pendente/bloqueada antes
     * de navegar — senão ela pode ser retomada fora de contexto pelo "destrava
     * áudio" no mesmo toque que disparou a navegação.
     */
    const irPara = useCallback((t: Tela) => {
        pararFala();
        setNav((n) => ({ ...n, tela: t, destaque: null }));
    }, [pararFala]);
    /**
     * Abre a tela de lições de um módulo.
     *
     * @param anunciar se `false`, a tela não repete a introdução falada (usado
     * ao voltar de uma atividade recém-concluída, cuja introdução já foi ouvida)
     */
    const abrirModulo = useCallback((m: ModuloId, anunciar: boolean = true) => {
        pararFala();
        setNav((n) => ({ ...n, moduloAtivo: m, tela: 'licoes', destaque: null, anunciarLicoes: anunciar }));
    }, [pararFala]);
    const irParaInicio = useCallback(() => {
        if (!estado) return;
        pararFala();
        const destino = destinoInicio(estado);
        setNav((n) => ({ ...n, ...destino, destaque: null, anunciarLicoes: true }));
    }, [estado, pararFala]);
    /** Abre a tela de atividade de uma lição específica. */
    const abrirLicao = useCallback((id: string) => {
        pararFala();
        setNav((n) => ({ ...n, licaoAtiva: id, tela: 'atividade', destaque: null }));
    }, [pararFala]);

    if (!estado) return null;

    return (
        <Ctx.Provider value={{
            estado, nav, pronto: true,
            abrirModulo, abrirLicao, irPara, irParaInicio, aplicarEstado, dispararEvento, pararFala,
            falar, tocarAudio,
        }}>
            {children}
        </Ctx.Provider>
    );
}