'use client';
import { Mic, MicOff } from 'lucide-react';
import { usarApp } from '@/contexto/AppProvider';

/**
 * Botão global de ligar/desligar a assistente Nina — canto superior ESQUERDO
 * em todas as telas, pra bater com a fala gravada (`explica_assistente`) que
 * descreve essa posição. Fica à esquerda do `BotaoVoltar` quando os dois aparecem juntos.
 */
export function BotaoNina() {
    const { estado, aplicarEstado, dispararEvento } = usarApp();

    const alternar = () => {
        const ativo = !estado.assistenteAtivo;
        aplicarEstado({ ...estado, assistenteAtivo: ativo });
        if (!ativo && typeof window !== 'undefined') window.speechSynthesis?.cancel();
        if (ativo) dispararEvento('O usuário ligou a assistente de volta.');
    };

    return (
        <button
            onClick={alternar}
            aria-label={estado.assistenteAtivo ? 'Desligar a assistente' : 'Ligar a assistente'}
            className={`absolute left-5 top-5 z-10 flex h-16 w-16 items-center justify-center rounded-full
                shadow-md transition active:scale-95 cursor-pointer hover:scale-105
                focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-400
                ${estado.assistenteAtivo
                    ? 'bg-sky-500 text-white'
                    : 'bg-white text-slate-400'}`}
        >
            {estado.assistenteAtivo ? <Mic size={30} /> : <MicOff size={30} />}
        </button>
    );
}
