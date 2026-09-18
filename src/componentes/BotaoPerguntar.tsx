'use client';
import { useEffect, useState } from 'react';
import { Mic, Loader2 } from 'lucide-react';
import { usarApp } from '@/contexto/AppProvider';

/** Resultado de reconhecimento de fala da Web Speech API (não tipada pelo TS). */
interface ResultadoReconhecimento {
    results: { [indice: number]: { [alternativa: number]: { transcript: string } } };
}

/** Subconjunto usado da interface `SpeechRecognition`/`webkitSpeechRecognition` (sem type lib própria). */
interface ReconhecimentoVoz {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    onresult: ((ev: ResultadoReconhecimento) => void) | null;
    onerror: (() => void) | null;
    onend: (() => void) | null;
    start: () => void;
}

type ConstrutorReconhecimento = new () => ReconhecimentoVoz;

/**
 * Obtém o construtor de reconhecimento de voz do navegador, se suportado.
 * Não está disponível em todos os navegadores (notavelmente o Firefox).
 */
function obterConstrutor(): ConstrutorReconhecimento | null {
    if (typeof window === 'undefined') return null;
    const w = window as unknown as {
        SpeechRecognition?: ConstrutorReconhecimento;
        webkitSpeechRecognition?: ConstrutorReconhecimento;
    };
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Botão global (mic) de pedido livre por voz: o aluno aperta, fala um pedido
 * livre ("volta pro menu", "quero ver os números"...) e a transcrição vira um
 * evento para o mesmo agente Nina que já sabe navegar pelo app. Se oculta
 * quando a assistente está desligada ou o navegador não suporta reconhecimento de voz.
 */
export function BotaoPerguntar() {
    const { estado, nav, pararFala, dispararEvento } = usarApp();
    const [suportado, setSuportado] = useState(false);
    const [ouvindo, setOuvindo] = useState(false);
    const [processando, setProcessando] = useState(false);

    useEffect(() => {
        // suporte do navegador só existe no cliente — calcular no render daria mismatch de hidratação
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSuportado(obterConstrutor() !== null);
    }, []);

    if (!estado.assistenteAtivo || !suportado) return null;

    /** Inicia uma captura de fala única e envia a transcrição como evento ao agente Nina. */
    const escutar = () => {
        const Construtor = obterConstrutor();
        if (!Construtor || ouvindo || processando) return;
        pararFala();

        const reconhecimento = new Construtor();
        reconhecimento.lang = 'pt-BR';
        reconhecimento.interimResults = false;
        reconhecimento.continuous = false;

        reconhecimento.onresult = (ev) => {
            const transcricao = ev.results[0]?.[0]?.transcript?.trim();
            if (!transcricao) return;
            setProcessando(true);
            const contexto = [`tela atual: ${nav.tela}`];
            if (nav.moduloAtivo) contexto.push(`área atual: ${nav.moduloAtivo}`);
            dispararEvento(
                `O aluno apertou o botão de falar com você e disse: "${transcricao}" (${contexto.join(', ')}). ` +
                'Entenda o pedido dele — se for para navegar, abrir uma área ou repetir uma explicação, ' +
                'use a ferramenta certa e já leve ele até lá. Se não entender o que ele quis dizer, ' +
                'peça para repetir de um jeito simples, sem inventar uma ação.'
            ).finally(() => setProcessando(false));
        };
        reconhecimento.onerror = () => setOuvindo(false);
        reconhecimento.onend = () => setOuvindo(false);

        setOuvindo(true);
        reconhecimento.start();
    };

    return (
        <button
            onClick={escutar}
            disabled={processando}
            aria-label={ouvindo ? 'Ouvindo' : 'Perguntar para a Nina'}
            className={`absolute cursor-pointer right-5 bottom-5 z-10 flex h-16 w-16 items-center justify-center
                 rounded-full shadow-md transition active:scale-95 hover:scale-105
                 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300
                 ${ouvindo ? 'bg-sky-700 text-white motion-safe:animate-pulse' : 'bg-white text-sky-600'}`}
        >
            {processando ? <Loader2 size={28} className="animate-spin" /> : <Mic size={28} />}
        </button>
    );
}
