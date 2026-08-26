'use client';
import {
    createContext, useContext, useEffect, useRef, useState, useCallback,
} from 'react';
import {
    EstadoApp, ModuloId, carregarEstado, salvarEstado, estadoInicial, estadoDemo,
} from '@/lib/estado';
import { FRASES } from '@/lib/frases';

type Tela = 'inicial' | 'modulos' | 'licoes' | 'atividade';

interface Navegacao {
    tela: Tela;
    moduloAtivo: ModuloId | null;
    licaoAtiva: string | null;
    destaque: string | null;
    // false quando se volta pras lições após terminar uma atividade — já se ouviu a introdução
    anunciarLicoes: boolean;
}

interface Acao { ferramenta: string; args: Record<string, unknown>; }

interface Contexto {
    estado: EstadoApp;
    nav: Navegacao;
    pronto: boolean;
    abrirModulo: (m: ModuloId, anunciar?: boolean) => void;
    abrirLicao: (id: string) => void;
    irPara: (t: Tela) => void;
    aplicarEstado: (novo: EstadoApp) => void;
    dispararEvento: (evento: string, fraseId?: string) => Promise<void>;
    pararFala: () => void;
}

const Ctx = createContext<Contexto | null>(null);

export const usarApp = () => {
    const c = useContext(Ctx);
    if (!c) throw new Error('usarApp fora do AppProvider');
    return c;
};

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [estado, setEstado] = useState<EstadoApp | null>(null);
    const [nav, setNav] = useState<Navegacao>({
        tela: 'inicial', moduloAtivo: null, licaoAtiva: null, destaque: null, anunciarLicoes: true,
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('demo') === '1') {
            const demo = estadoDemo();
            salvarEstado(demo);
            setEstado(demo);
            return;
        }
        if (params.get('reset') === '1') {
            const novo = estadoInicial();
            salvarEstado(novo);
            setEstado(novo);
            return;
        }
        setEstado(carregarEstado());
    }, []);

    const aplicarEstado = useCallback((novo: EstadoApp) => {
        setEstado(novo);
        salvarEstado(novo);
    }, []);

    // Nina só fala uma coisa por vez: qualquer fala nova cala a anterior (gravada ou TTS)
    const audioAtualRef = useRef<HTMLAudioElement | null>(null);
    // libera quem está esperando a fala atual terminar (ver dispararEvento) quando ela é cortada
    const liberarEsperaRef = useRef<(() => void) | null>(null);

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

    // devolve uma Promise que só resolve quando a fala termina de verdade —
    // assim quem chama pode esperar o áudio acabar antes de seguir em frente
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

    // frases fixas (catálogo em frases.ts) usam o áudio gravado em vez do TTS
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

    // primeiro toque na tela "destrava" o áudio: retoma o que ficou bloqueado por autoplay
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

    // resolve só quando a Nina termina de falar — quem chama pode esperar antes de avançar
    // (ex: só trocar de exercício depois que o "acertou" tiver acabado de tocar)
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

    // toda navegação cala a fala pendente/bloqueada — senão ela pode ser retomada
    // fora de contexto pelo "destrava áudio" no toque que dispara a própria navegação
    const irPara = useCallback((t: Tela) => {
        pararFala();
        setNav((n) => ({ ...n, tela: t, destaque: null }));
    }, [pararFala]);
    const abrirModulo = useCallback((m: ModuloId, anunciar: boolean = true) => {
        pararFala();
        setNav((n) => ({ ...n, moduloAtivo: m, tela: 'licoes', destaque: null, anunciarLicoes: anunciar }));
    }, [pararFala]);
    const abrirLicao = useCallback((id: string) => {
        pararFala();
        setNav((n) => ({ ...n, licaoAtiva: id, tela: 'atividade', destaque: null }));
    }, [pararFala]);

    if (!estado) return null;

    return (
        <Ctx.Provider value={{
            estado, nav, pronto: true,
            abrirModulo, abrirLicao, irPara, aplicarEstado, dispararEvento, pararFala,
        }}>
            {children}
        </Ctx.Provider>
    );
}