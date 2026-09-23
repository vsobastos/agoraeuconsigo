'use client';
import { ArrowLeft } from 'lucide-react';
import { usarApp } from '@/contexto/AppProvider';

/** Tela anterior no back stack, para cada tela que tem "voltar". */
const DESTINO = {
    licoes: 'modulos',
    atividade: 'licoes',
    perfis: 'entrada',
    meus_dados: 'modulos',
} as const;

/**
 * Botão global de voltar, ausente nas telas sem anterior no back stack
 * (`modulos`, topo das lições, e as telas de acesso).
 * Fica deslocado para a direita do `BotaoNina`, que ocupa o canto superior
 * esquerdo em todas as telas.
 */
export function BotaoVoltar() {
    const { nav, irPara } = usarApp();
    const destino = DESTINO[nav.tela as keyof typeof DESTINO];
    if (!destino) return null;

    return (
        <button
            onClick={() => irPara(destino)}
            aria-label="Voltar"
            className="absolute cursor-pointer left-24 top-5 z-10 flex h-16 w-16 items-center justify-center
                 rounded-full bg-white text-stone-600 shadow-md transition active:scale-95 hover:scale-105
                 focus:outline-none focus-visible:ring-4 focus-visible:ring-stone-300"
        >
            <ArrowLeft size={30} />
        </button>
    );
}