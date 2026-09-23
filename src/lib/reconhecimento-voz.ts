/** Resultado de reconhecimento de fala da Web Speech API (não tipada pelo TS). */
export interface ResultadoReconhecimento {
    results: { [indice: number]: { [alternativa: number]: { transcript: string } } };
}

/** Evento de erro do reconhecimento — `error` nem sempre vem preenchido. */
export interface ErroReconhecimento { error?: string; }

/** Subconjunto usado da interface `SpeechRecognition`/`webkitSpeechRecognition` (sem type lib própria). */
export interface ReconhecimentoVoz {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    onresult: ((ev: ResultadoReconhecimento) => void) | null;
    onerror: ((ev: ErroReconhecimento) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
}

export type ConstrutorReconhecimento = new () => ReconhecimentoVoz;

/**
 * Obtém o construtor de reconhecimento de voz do navegador, se suportado.
 * Não está disponível em todos os navegadores (notavelmente o Firefox).
 */
export function obterConstrutorReconhecimento(): ConstrutorReconhecimento | null {
    if (typeof window === 'undefined') return null;
    const w = window as unknown as {
        SpeechRecognition?: ConstrutorReconhecimento;
        webkitSpeechRecognition?: ConstrutorReconhecimento;
    };
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}
