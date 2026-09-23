'use client';
import { Volume2 } from 'lucide-react';
import { usarApp } from '@/contexto/AppProvider';

/** `audio`: caminho de um áudio pré-gravado (`frases.ts`); `texto`: fala dinâmica, dita por TTS. */
type Props = { audio: string; texto?: never } | { texto: string; audio?: never };

/** Repete a instrução atual — usado nas telas do fluxo de acesso. */
export function BotaoOuvirDeNovo({ audio, texto }: Props) {
    const { estado, falar, tocarAudio } = usarApp();
    if (!estado.assistenteAtivo) return null;

    return (
        <button
            onClick={() => (audio ? tocarAudio(audio) : falar(texto!))}
            aria-label="Ouvir de novo"
            className="cursor-pointer flex items-center gap-2 rounded-full bg-white px-5 py-3 text-base
                 font-semibold text-stone-600 shadow-md transition active:scale-95 hover:scale-105
                 focus:outline-none focus-visible:ring-4 focus-visible:ring-stone-300"
        >
            <Volume2 size={22} /> Ouvir de novo
        </button>
    );
}
