// src/componentes/BotaoPerguntar.tsx
'use client';
import { useEffect, useState } from 'react';
import { Mic, Loader2 } from 'lucide-react';
import { usarApp } from '@/contexto/AppProvider';

interface ResultadoReconhecimento {
    results: { [indice: number]: { [alternativa: number]: { transcript: string } } };
}

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

function obterConstrutor(): ConstrutorReconhecimento | null {
    if (typeof window === 'undefined') return null;
    const w = window as unknown as {
        SpeechRecognition?: ConstrutorReconhecimento;
        webkitSpeechRecognition?: ConstrutorReconhecimento;
    };
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// botão global: o aluno aperta, fala um pedido livre ("volta pro menu", "quero ver os números"...)
// e a transcrição vira um evento pro mesmo agente que já sabe navegar pelo app
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
                 ${ouvindo ? 'bg-sky-500 text-white motion-safe:animate-pulse' : 'bg-white text-sky-600'}`}
        >
            {processando ? <Loader2 size={28} className="animate-spin" /> : <Mic size={28} />}
        </button>
    );
}
